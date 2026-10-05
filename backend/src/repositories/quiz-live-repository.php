<?php

declare(strict_types=1);

final class QuizLiveRepository
{
    public function __construct(private readonly PDO $database)
    {
    }

    public function findRoomByCode(string $code, bool $lock = false): ?array
    {
        $sql = $this->roomQuery() . ' WHERE code = :code LIMIT 1' . ($lock ? ' FOR UPDATE' : '');
        $statement = $this->database->prepare($sql);
        $statement->execute(['code' => $code]);
        return $statement->fetch() ?: null;
    }

    public function findRoom(int $roomId, bool $lock = false): ?array
    {
        $sql = $this->roomQuery() . ' WHERE id = :id LIMIT 1' . ($lock ? ' FOR UPDATE' : '');
        $statement = $this->database->prepare($sql);
        $statement->execute(['id' => $roomId]);
        return $statement->fetch() ?: null;
    }

    private function roomQuery(): string
    {
        return 'SELECT id, creator_id, title, code, status, live_status, question_time_seconds, '
            . 'current_question_index, paused_remaining_ms, '
            . 'GREATEST(0, TIMESTAMPDIFF(MICROSECOND, NOW(6), question_deadline_at) DIV 1000) AS remaining_ms, '
            . 'GREATEST(0, TIMESTAMPDIFF(MICROSECOND, NOW(6), reveal_until) DIV 1000) AS reveal_remaining_ms '
            . 'FROM quiz_rooms';
    }

    public function questionCount(int $roomId): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM quiz_questions WHERE room_id = ?');
        $statement->execute([$roomId]);
        return (int) $statement->fetchColumn();
    }

    public function questionAt(int $roomId, int $index, bool $includeCorrect): ?array
    {
        $columns = 'id, question_text, points_value' . ($includeCorrect ? ', correct_option' : '');
        $statement = $this->database->prepare(
            "SELECT {$columns} FROM quiz_questions WHERE room_id = :room_id ORDER BY id LIMIT 1 OFFSET :question_index"
        );
        $statement->bindValue(':room_id', $roomId, PDO::PARAM_INT);
        $statement->bindValue(':question_index', $index, PDO::PARAM_INT);
        $statement->execute();
        $question = $statement->fetch();
        if (!$question) return null;

        $options = $this->database->prepare(
            'SELECT option_position AS position, option_text AS text FROM quiz_question_options '
            . 'WHERE question_id = ? ORDER BY option_position'
        );
        $options->execute([(int) $question['id']]);
        $question['options'] = $options->fetchAll();
        return $question;
    }

    public function findAttempt(int $roomId, int $userId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT id, finished_at FROM quiz_attempts WHERE room_id = ? AND user_id = ? LIMIT 1'
        );
        $statement->execute([$roomId, $userId]);
        return $statement->fetch() ?: null;
    }

    public function findAttemptById(int $attemptId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT id, room_id, user_id, finished_at FROM quiz_attempts WHERE id = ? LIMIT 1'
        );
        $statement->execute([$attemptId]);
        return $statement->fetch() ?: null;
    }

    public function registerPlayer(int $roomId, int $userId, int $attemptId): void
    {
        $statement = $this->database->prepare(
            'INSERT IGNORE INTO quiz_live_players (room_id, user_id, attempt_id) VALUES (?, ?, ?)'
        );
        $statement->execute([$roomId, $userId, $attemptId]);
    }

    public function isPlayer(int $roomId, int $userId): bool
    {
        $statement = $this->database->prepare(
            'SELECT 1 FROM quiz_live_players WHERE room_id = ? AND user_id = ? LIMIT 1'
        );
        $statement->execute([$roomId, $userId]);
        return (bool) $statement->fetchColumn();
    }

    public function playerCount(int $roomId): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM quiz_live_players WHERE room_id = ?');
        $statement->execute([$roomId]);
        return (int) $statement->fetchColumn();
    }

    public function players(int $roomId): array
    {
        $statement = $this->database->prepare(
            'SELECT p.user_id, p.attempt_id, u.full_name AS name, '
            . 'COALESCE(SUM(a.points_awarded), 0) AS score, '
            . 'COALESCE(SUM(a.is_correct), 0) AS correct_count '
            . 'FROM quiz_live_players p JOIN users u ON u.id = p.user_id '
            . 'LEFT JOIN quiz_live_answers a ON a.attempt_id = p.attempt_id '
            . 'WHERE p.room_id = ? GROUP BY p.user_id, p.attempt_id, u.full_name '
            . 'ORDER BY score DESC, correct_count DESC, name ASC'
        );
        $statement->execute([$roomId]);
        return $statement->fetchAll();
    }

    public function answeredCount(int $questionId): int
    {
        $statement = $this->database->prepare('SELECT COUNT(*) FROM quiz_live_answers WHERE question_id = ?');
        $statement->execute([$questionId]);
        return (int) $statement->fetchColumn();
    }

    public function answerFor(int $attemptId, int $questionId): ?array
    {
        $statement = $this->database->prepare(
            'SELECT option_position, is_correct, response_time_ms, points_awarded '
            . 'FROM quiz_live_answers WHERE attempt_id = ? AND question_id = ? LIMIT 1'
        );
        $statement->execute([$attemptId, $questionId]);
        return $statement->fetch() ?: null;
    }

    public function saveAnswer(int $attemptId, int $questionId, int $position, bool $correct, int $timeMs, int $points): void
    {
        $statement = $this->database->prepare(
            'INSERT INTO quiz_live_answers (attempt_id, question_id, option_position, is_correct, response_time_ms, points_awarded) '
            . 'VALUES (?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([$attemptId, $questionId, $position, (int) $correct, $timeMs, $points]);
    }

    public function openRoom(int $roomId): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET live_status = 'waiting', question_started_at = NULL, question_deadline_at = NULL, reveal_until = NULL WHERE id = ?"
        );
        $statement->execute([$roomId]);
    }

    public function setDuration(int $roomId, int $seconds): void
    {
        $statement = $this->database->prepare('UPDATE quiz_rooms SET question_time_seconds = ? WHERE id = ?');
        $statement->execute([$seconds, $roomId]);
    }

    public function startQuestion(int $roomId, int $index, int $seconds): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET live_status = 'question', current_question_index = ?, "
            . 'question_started_at = NOW(6), question_deadline_at = TIMESTAMPADD(SECOND, ?, NOW(6)), '
            . 'reveal_until = NULL, paused_remaining_ms = NULL, live_started_at = COALESCE(live_started_at, NOW(6)) WHERE id = ?'
        );
        $statement->execute([$index, $seconds, $roomId]);
    }

    public function revealQuestion(int $roomId): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET live_status = 'reveal', reveal_until = DATE_ADD(NOW(6), INTERVAL 4 SECOND), "
            . 'question_deadline_at = NULL WHERE id = ?'
        );
        $statement->execute([$roomId]);
    }

    public function pauseQuestion(int $roomId): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET paused_remaining_ms = GREATEST(0, TIMESTAMPDIFF(MICROSECOND, NOW(6), question_deadline_at) DIV 1000), "
            . "live_status = 'paused', question_deadline_at = NULL WHERE id = ?"
        );
        $statement->execute([$roomId]);
    }

    public function resumeQuestion(int $roomId): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET live_status = 'question', question_started_at = NOW(6), "
            . 'question_deadline_at = TIMESTAMPADD(MICROSECOND, COALESCE(paused_remaining_ms, 0) * 1000, NOW(6)), '
            . 'paused_remaining_ms = NULL WHERE id = ?'
        );
        $statement->execute([$roomId]);
    }

    public function finishRoom(int $roomId): void
    {
        $statement = $this->database->prepare(
            "UPDATE quiz_rooms SET live_status = 'finished', live_finished_at = NOW(6), question_deadline_at = NULL, "
            . 'reveal_until = NULL, paused_remaining_ms = NULL WHERE id = ?'
        );
        $statement->execute([$roomId]);
    }

    public function finishPlayerAttempts(int $roomId, int $totalQuestions): array
    {
        $statement = $this->database->prepare(
            'SELECT p.user_id, p.attempt_id, COALESCE(SUM(a.points_awarded), 0) AS score, '
            . 'COUNT(a.id) AS answered_count, COALESCE(SUM(a.is_correct), 0) AS correct_count '
            . 'FROM quiz_live_players p LEFT JOIN quiz_live_answers a ON a.attempt_id = p.attempt_id '
            . 'WHERE p.room_id = ? GROUP BY p.user_id, p.attempt_id'
        );
        $statement->execute([$roomId]);
        $players = $statement->fetchAll();
        $update = $this->database->prepare(
            'UPDATE quiz_attempts SET score = ?, total_questions = ?, finished_at = NOW() WHERE id = ? AND finished_at IS NULL'
        );
        foreach ($players as $player) {
            $update->execute([(int) $player['score'], $totalQuestions, (int) $player['attempt_id']]);
        }
        return $players;
    }

    public function roomQuestionIndex(int $roomId): int
    {
        $statement = $this->database->prepare('SELECT current_question_index FROM quiz_rooms WHERE id = ?');
        $statement->execute([$roomId]);
        return (int) $statement->fetchColumn();
    }
}
