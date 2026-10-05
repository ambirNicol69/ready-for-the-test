<?php

declare(strict_types=1);

final class QuizRoomController
{
    public function __construct(
        private readonly QuizRoomService $service,
        private readonly QuizAutoService $autoService,
        private readonly QuizLiveService $liveService
    ) {
    }

    public function create(User $user): void
    {
        $this->assertTeacher($user);
        $requestBody = readJsonBody();
        $result = $this->service->createRoom(
            $user->id,
            $requestBody['title'] ?? '',
            $requestBody['questions'] ?? []
        );

        jsonResponse(201, true, $result, 'Sala creada');
    }

    public function autoTopics(User $user): void
    {
        $this->assertTeacher($user);
        jsonResponse(200, true, $this->autoService->topics(), 'Temas disponibles');
    }

    public function autoCreate(User $user): void
    {
        $this->assertTeacher($user);
        $requestBody = readJsonBody();
        $result = $this->autoService->createAutoRoom(
            $user->id,
            $requestBody['title'] ?? '',
            $requestBody['topic'] ?? '',
            (int) ($requestBody['question_count'] ?? 0),
            (int) ($requestBody['points_value'] ?? 0)
        );

        jsonResponse(201, true, $result, 'Sala generada con IA');
    }

    public function list(User $user): void
    {
        $this->assertTeacher($user);
        jsonResponse(200, true, $this->service->listRooms($user->id), 'Salas obtenidas');
    }

    public function get(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        jsonResponse(200, true, $this->service->getRoom($roomId, $user->id), 'Sala obtenida');
    }

    public function delete(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $this->service->deleteRoom($roomId, $user->id);
        jsonResponse(200, true, null, 'Sala eliminada');
    }

    public function join(User $user): void
    {
        $this->assertStudent($user);
        $requestBody = readJsonBody();
        $code = trim($requestBody['code'] ?? '');
        $result = $this->liveService->joinIfPrepared($user->id, $code);
        if ($result === null) $result = $this->service->joinRoom($user->id, $code);

        jsonResponse(201, true, $result, ($result['mode'] ?? '') === 'live' ? 'Competencia en vivo abierta' : 'Sala abierta');
    }

    public function prepareLive(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $body = readJsonBody();
        $this->liveService->prepare($user->id, $roomId, (int) ($body['question_time_seconds'] ?? 20));
        jsonResponse(200, true, null, 'Sala de espera preparada');
    }

    public function startLive(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $this->liveService->start($user->id, $roomId);
        jsonResponse(200, true, null, 'Competencia iniciada');
    }

    public function liveState(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        jsonResponse(200, true, $this->liveService->hostState($user->id, $roomId), 'Estado en vivo obtenido');
    }

    public function advanceLive(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $this->liveService->advance($user->id, $roomId);
        jsonResponse(200, true, null, 'Partida avanzada');
    }

    public function toggleLivePause(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $this->liveService->togglePause($user->id, $roomId);
        jsonResponse(200, true, null, 'Estado de pausa actualizado');
    }

    public function finishLive(User $user, int $roomId): void
    {
        $this->assertTeacher($user);
        $this->liveService->finish($user->id, $roomId);
        jsonResponse(200, true, null, 'Competencia finalizada');
    }

    public function studentLiveState(User $user, int $attemptId): void
    {
        $this->assertStudent($user);
        jsonResponse(200, true, $this->liveService->studentState($user->id, $attemptId), 'Estado en vivo obtenido');
    }

    public function answerLive(User $user): void
    {
        $this->assertStudent($user);
        $body = readJsonBody();
        $result = $this->liveService->answer(
            $user->id,
            (int) ($body['attempt_id'] ?? 0),
            (int) ($body['question_id'] ?? 0),
            (int) ($body['option_position'] ?? 0)
        );
        jsonResponse(200, true, $result, 'Respuesta registrada');
    }

    public function submit(User $user): void
    {
        $this->assertStudent($user);
        $requestBody = readJsonBody();
        $this->liveService->assertPracticeAttempt($user->id, (int) ($requestBody['attempt_id'] ?? 0));
        $result = $this->service->submitAnswers(
            $user->id,
            (int) ($requestBody['attempt_id'] ?? 0),
            $requestBody['answers'] ?? []
        );

        jsonResponse(200, true, $result, 'Respuestas calificadas');
    }

    private function assertTeacher(User $user): void
    {
        if ($user->role !== User::ROLE_TEACHER) {
            throw new ForbiddenException('Solo los docentes pueden gestionar salas');
        }
    }

    private function assertStudent(User $user): void
    {
        if ($user->role !== User::ROLE_STUDENT) {
            throw new ForbiddenException(
                "Solo las cuentas con rol 'estudiante' pueden unirse a salas. El rol actual es '{$user->role}'."
            );
        }
    }
}
