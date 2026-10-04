<?php

declare(strict_types=1);

final class MinigameController
{
    private const ALLOWED_GAMES = [
        'reto-calculadora',
        'ordena-ecuacion',
        'carrera-conversiones',
        'instrumento-fisica',
        'sustancia-misteriosa',
        'mezcla-segura',
    ];
    private const MIN_SCORE = 80;
    private const MAX_SCORE = 90;
    private const MAX_DURATION_SECONDS = 86400;

    public function __construct(private readonly PDO $db) {}

    public function saveAttempt(User $user): void
    {
        $this->assertStudent($user);
        $body = readJsonBody();
        $gameCode = (string) ($body['game_code'] ?? '');
        $attemptToken = (string) ($body['attempt_token'] ?? '');
        $score = filter_var($body['score'] ?? null, FILTER_VALIDATE_INT);
        $duration = filter_var($body['duration_seconds'] ?? null, FILTER_VALIDATE_INT);
        $this->assertGame($gameCode);
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $attemptToken)) {
            throw new ValidationException('El identificador de la partida no es válido');
        }
        if ($score === false || $score < self::MIN_SCORE || $score > self::MAX_SCORE) {
            throw new ValidationException('La puntuaciÃ³n no es vÃ¡lida');
        }
        if ($duration === false || $duration < 1 || $duration > self::MAX_DURATION_SECONDS) {
            throw new ValidationException('El tiempo de la partida no es vÃ¡lido');
        }

        $this->db->beginTransaction();
        try {
            $statement = $this->db->prepare(
                'INSERT IGNORE INTO minigame_attempts (attempt_token, user_id, game_code, score, duration_seconds) '
                . 'VALUES (?, ?, ?, ?, ?)'
            );
            $statement->execute([$attemptToken, $user->id, $gameCode, $score, $duration]);

            $isNewAttempt = $statement->rowCount() === 1;
            if ($isNewAttempt) {
                $this->addStudentPoints($score, $user->id);
            } else {
                $this->assertSameAttempt($attemptToken, $user->id, $gameCode, $score, $duration);
            }
            $stats = $this->statsFor($user->id, $gameCode);
            $stats['points_awarded'] = $isNewAttempt;
            $this->db->commit();
        } catch (Throwable $error) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $error;
        }

        $message = $stats['points_awarded']
            ? 'Partida guardada y puntos añadidos al estudiante'
            : 'La partida ya estaba guardada; no se duplicaron los puntos';
        jsonResponse(201, true, $stats, $message);
    }

    public function stats(User $user, string $gameCode): void
    {
        $this->assertStudent($user);
        $this->assertGame($gameCode);
        jsonResponse(200, true, $this->statsFor($user->id, $gameCode), 'Récords personales obtenidos');
    }

    private function statsFor(int $userId, string $gameCode): array
    {
        $statement = $this->db->prepare(
            'SELECT COUNT(*) attempts, MAX(score) best_score, MIN(duration_seconds) best_time '
            . 'FROM minigame_attempts WHERE user_id=? AND game_code=?'
        );
        $statement->execute([$userId, $gameCode]);
        $stats = $statement->fetch();
        return [
            'attempts' => (int) $stats['attempts'],
            'best_score' => $stats['best_score'] === null ? null : (int) $stats['best_score'],
            'best_time_seconds' => $stats['best_time'] === null ? null : (int) $stats['best_time'],
        ];
    }

    private function addStudentPoints(int $score, int $userId): void
    {
        $statement = $this->db->prepare('UPDATE users SET points=points+? WHERE id=?');
        $statement->execute([$score, $userId]);
        if ($statement->rowCount() !== 1) {
            throw new NotFoundException('No se encontró el estudiante');
        }
    }

    private function assertSameAttempt(string $token, int $userId, string $gameCode, int $score, int $duration): void
    {
        $statement = $this->db->prepare(
            'SELECT score, duration_seconds FROM minigame_attempts '
            . 'WHERE attempt_token=? AND user_id=? AND game_code=?'
        );
        $statement->execute([$token, $userId, $gameCode]);
        $attempt = $statement->fetch();
        if (!$attempt || (int) $attempt['score'] !== $score || (int) $attempt['duration_seconds'] !== $duration) {
            throw new ValidationException('El identificador de partida ya fue utilizado');
        }
    }

    private function assertStudent(User $user): void
    {
        if ($user->role !== User::ROLE_STUDENT) {
            throw new ForbiddenException('Los minijuegos son solo para estudiantes');
        }
    }

    private function assertGame(string $gameCode): void
    {
        if (!in_array($gameCode, self::ALLOWED_GAMES, true)) {
            throw new ValidationException('El minijuego no es válido');
        }
    }
}
