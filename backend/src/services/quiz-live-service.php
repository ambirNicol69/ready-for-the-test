<?php

declare(strict_types=1);

final class QuizLiveService
{
    private const ALLOWED_TIMERS = [15, 20, 30, 45, 60];
    private const SPEED_BONUS_RATIO = 0.5;

    public function __construct(
        private readonly PDO $database, private readonly QuizLiveRepository $liveRepository,
        private readonly QuizAttemptRepository $attemptRepository, private readonly UserRepository $userRepository
    ) {
    }

    public function joinIfPrepared(int $userId, string $code): ?array
    {
        $code = strtoupper($code);
        $room = $this->liveRepository->findRoomByCode($code);
        if ($room === null || $room['live_status'] === 'disabled') return null;
        $this->database->beginTransaction();
        try {
            $room = $this->liveRepository->findRoomByCode($code, true);
            if ($room === null || $room['live_status'] === 'disabled') {
                $this->database->commit();
                return null;
            }
            if ($room['status'] !== 'abierta') throw new ValidationException('La sala está cerrada');
            $roomId = (int) $room['id'];
            $existingPlayer = $this->liveRepository->isPlayer($roomId, $userId);
            if (!$existingPlayer && $room['live_status'] !== 'waiting') {
                throw new ValidationException('La competencia ya comenzó y no acepta nuevos participantes');
            }
            $attempt = $this->liveRepository->findAttempt($roomId, $userId);
            if ($attempt !== null && $attempt['finished_at'] !== null && !$existingPlayer) {
                throw new ValidationException('Ya realizaste esta sala');
            }
            $attemptId = $attempt === null
                ? $this->attemptRepository->create(new QuizAttempt(
                    null, $roomId, $userId, 0, $this->liveRepository->questionCount($roomId), null, null
                ))
                : (int) $attempt['id'];
            $this->liveRepository->registerPlayer($roomId, $userId, $attemptId);
            $this->database->commit();
            return [
                'mode' => 'live',
                'attempt_id' => $attemptId,
                'room' => ['id' => $roomId, 'title' => $room['title'], 'code' => $room['code']],
            ];
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function prepare(int $teacherId, int $roomId, int $seconds): void
    {
        $this->assertTimer($seconds);
        $this->database->beginTransaction();
        try {
            $room = $this->ownedRoom($teacherId, $roomId, true);
            if ($room['live_status'] !== 'disabled') throw new ValidationException('Esta sala ya fue preparada o jugada');
            if ($room['status'] !== 'abierta') throw new ValidationException('La sala está cerrada');
            $this->liveRepository->setDuration($roomId, $seconds);
            $this->liveRepository->openRoom($roomId);
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function start(int $teacherId, int $roomId): void
    {
        $this->database->beginTransaction();
        try {
            $room = $this->ownedRoom($teacherId, $roomId, true);
            if ($room['live_status'] !== 'waiting') throw new ValidationException('La sala no está esperando participantes');
            if ($this->liveRepository->playerCount($roomId) < 1) throw new ValidationException('Espera a que se una al menos un estudiante');
            if ($this->liveRepository->questionCount($roomId) < 1) throw new ValidationException('La sala no tiene preguntas');
            $this->liveRepository->startQuestion($roomId, 0, (int) $room['question_time_seconds']);
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function hostState(int $teacherId, int $roomId): array
    {
        $this->syncRoom($roomId);
        $room = $this->ownedRoom($teacherId, $roomId);
        return $this->buildState($room, null, true);
    }

    public function studentState(int $studentId, int $attemptId): array
    {
        $attempt = $this->liveRepository->findAttemptById($attemptId);
        if ($attempt === null || (int) $attempt['user_id'] !== $studentId
            || !$this->liveRepository->isPlayer((int) $attempt['room_id'], $studentId)) {
            throw new NotFoundException('Participación en vivo no encontrada');
        }
        $this->syncRoom((int) $attempt['room_id']);
        $room = $this->liveRepository->findRoom((int) $attempt['room_id']);
        return $this->buildState($room, $attemptId, false);
    }

    public function answer(int $studentId, int $attemptId, int $questionId, int $position): array
    {
        if ($position < 1 || $position > 4) throw new ValidationException('Selecciona una opción válida');
        $attempt = $this->liveRepository->findAttemptById($attemptId);
        if ($attempt === null || (int) $attempt['user_id'] !== $studentId
            || !$this->liveRepository->isPlayer((int) $attempt['room_id'], $studentId)) {
            throw new NotFoundException('Participación en vivo no encontrada');
        }
        $roomId = (int) $attempt['room_id'];
        $this->syncRoom($roomId);
        $this->database->beginTransaction();
        try {
            $room = $this->liveRepository->findRoom($roomId, true);
            if ($room['live_status'] !== 'question' || (int) $room['remaining_ms'] <= 0) {
                if ($room['live_status'] === 'question') $this->liveRepository->revealQuestion($roomId);
                $this->database->commit();
                throw new ValidationException('Se acabó el tiempo para responder');
            }
            $question = $this->liveRepository->questionAt($roomId, (int) $room['current_question_index'], true);
            if ($question === null || (int) $question['id'] !== $questionId) {
                throw new ValidationException('La pregunta ya cambió');
            }
            if ($this->liveRepository->answerFor($attemptId, $questionId) !== null) {
                throw new ValidationException('Ya registraste tu respuesta');
            }
            $remaining = (int) $room['remaining_ms'];
            $duration = (int) $room['question_time_seconds'] * 1000;
            $correct = $position === (int) $question['correct_option'];
            $bonus = $correct ? (int) floor((int) $question['points_value'] * self::SPEED_BONUS_RATIO * $remaining / $duration) : 0;
            $points = $correct ? (int) $question['points_value'] + $bonus : 0;
            $this->liveRepository->saveAnswer(
                $attemptId, $questionId, $position, $correct, max(0, $duration - $remaining), $points
            );
            $this->database->commit();
            return ['accepted' => true, 'points_awarded' => $points];
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function assertPracticeAttempt(int $studentId, int $attemptId): void
    {
        $attempt = $this->liveRepository->findAttemptById($attemptId);
        if ($attempt === null || (int) $attempt['user_id'] !== $studentId) {
            throw new NotFoundException('Intento no encontrado');
        }
        $room = $this->liveRepository->findRoom((int) $attempt['room_id']);
        if ($room !== null && $room['live_status'] !== 'disabled') {
            throw new ValidationException('Esta sala está configurada como competencia en vivo');
        }
    }

    public function advance(int $teacherId, int $roomId): void
    {
        $this->database->beginTransaction();
        try {
            $room = $this->ownedRoom($teacherId, $roomId, true);
            if ($room['live_status'] === 'question') {
                $this->liveRepository->revealQuestion($roomId);
            } elseif ($room['live_status'] === 'reveal') {
                $this->openNextOrFinish($room);
            } else {
                throw new ValidationException('No se puede avanzar en este momento');
            }
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function togglePause(int $teacherId, int $roomId): void
    {
        $this->database->beginTransaction();
        try {
            $room = $this->ownedRoom($teacherId, $roomId, true);
            if ($room['live_status'] === 'question') $this->liveRepository->pauseQuestion($roomId);
            elseif ($room['live_status'] === 'paused') $this->liveRepository->resumeQuestion($roomId);
            else throw new ValidationException('Solo se puede pausar o reanudar una pregunta activa');
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    public function finish(int $teacherId, int $roomId): void
    {
        $this->database->beginTransaction();
        try {
            $room = $this->ownedRoom($teacherId, $roomId, true);
            if ($room['live_status'] === 'disabled' || $room['live_status'] === 'finished') {
                throw new ValidationException('La competencia no está activa');
            }
            $this->finalizeRoom($roomId);
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    private function syncRoom(int $roomId): void
    {
        $this->database->beginTransaction();
        try {
            $room = $this->liveRepository->findRoom($roomId, true);
            if ($room === null) throw new NotFoundException('Sala no encontrada');
            if ($room['live_status'] === 'question' && (int) $room['remaining_ms'] <= 0) {
                $this->liveRepository->revealQuestion($roomId);
                $room = $this->liveRepository->findRoom($roomId, true);
            }
            if ($room['live_status'] === 'reveal' && (int) $room['reveal_remaining_ms'] <= 0) {
                $this->openNextOrFinish($room);
            }
            $this->database->commit();
        } catch (Throwable $error) {
            if ($this->database->inTransaction()) $this->database->rollBack();
            throw $error;
        }
    }

    private function openNextOrFinish(array $room): void
    {
        $roomId = (int) $room['id'];
        $next = (int) $room['current_question_index'] + 1;
        if ($next >= $this->liveRepository->questionCount($roomId)) {
            $this->finalizeRoom($roomId);
            return;
        }
        $this->liveRepository->startQuestion($roomId, $next, (int) $room['question_time_seconds']);
    }

    private function finalizeRoom(int $roomId): void
    {
        $this->liveRepository->finishRoom($roomId);
        $players = $this->liveRepository->finishPlayerAttempts(
            $roomId, $this->liveRepository->questionCount($roomId)
        );
        foreach ($players as $player) {
            if ((int) $player['score'] > 0) {
                $this->userRepository->addPoints((int) $player['user_id'], (int) $player['score']);
            }
        }
    }

    private function buildState(array $room, ?int $attemptId, bool $forTeacher): array
    {
        $status = $room['live_status'];
        $index = (int) $room['current_question_index'];
        $total = $this->liveRepository->questionCount((int) $room['id']);
        $question = null;
        if (in_array($status, ['question', 'reveal', 'paused'], true) && $index < $total) {
            $question = $this->liveRepository->questionAt((int) $room['id'], $index, $status === 'reveal');
            if ($question !== null) $question['answered_count'] = $this->liveRepository->answeredCount((int) $question['id']);
        }
        $players = $this->liveRepository->players((int) $room['id']);
        $myAnswer = $attemptId !== null && $question !== null
            ? $this->liveRepository->answerFor($attemptId, (int) $question['id']) : null;

        return [
            'room' => ['id' => (int) $room['id'], 'title' => $room['title'], 'code' => $room['code']],
            'status' => $status,
            'question_index' => $index + 1,
            'total_questions' => $total,
            'question_time_seconds' => (int) $room['question_time_seconds'],
            'remaining_ms' => $status === 'paused' ? (int) ($room['paused_remaining_ms'] ?? 0) : (int) $room['remaining_ms'],
            'question' => $question,
            'my_answer' => $myAnswer,
            'players' => $players,
            'leaderboard' => in_array($status, ['reveal', 'finished'], true) ? $players : [],
            'is_teacher' => $forTeacher,
        ];
    }

    private function ownedRoom(int $teacherId, int $roomId, bool $lock = false): array
    {
        $room = $this->liveRepository->findRoom($roomId, $lock);
        if ($room === null || (int) $room['creator_id'] !== $teacherId) {
            throw new NotFoundException('Sala no encontrada');
        }
        return $room;
    }

    private function assertTimer(int $seconds): void
    {
        if (!in_array($seconds, self::ALLOWED_TIMERS, true)) {
            throw new ValidationException('Elige 15, 20, 30, 45 o 60 segundos');
        }
    }
}
