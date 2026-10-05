<?php

declare(strict_types=1);

final class LessonProgressController
{
    private const ANSWERS = [
        'quimica-enlaces' => 2,
        'fisica-inercia' => 2,
        'matematicas-ecuaciones' => 2,
        'matematicas-fracciones' => 2,
        'matematicas-potencias-raices' => 1,
        'matematicas-proporcionalidad' => 2,
        'matematicas-funcion-lineal' => 1,
        'matematicas-sistemas-2x2' => 2,
        'matematicas-pitagoras' => 1,
        'fisica-mru' => 2,
        'fisica-mrua' => 1,
        'fisica-segunda-ley' => 2,
        'fisica-masa-peso' => 2,
        'fisica-trabajo-energia' => 2,
        'fisica-ley-ohm' => 2,
        'quimica-estructura-atomica' => 1,
        'quimica-tabla-periodica' => 2,
        'quimica-estados-materia' => 2,
        'quimica-separacion-mezclas' => 2,
        'quimica-acidos-bases-ph' => 2,
        'quimica-balanceo-ecuaciones' => 1,
    ];

    public function __construct(private readonly PDO $db) {}

    public function list(User $user): void
    {
        $this->assertStudent($user);
        $stmt = $this->db->prepare('SELECT lesson_slug, phase FROM student_lesson_progress WHERE student_id=?');
        $stmt->execute([$user->id]);
        $progress = [];
        foreach ($stmt->fetchAll() as $row) $progress[$row['lesson_slug']] = (int) $row['phase'];
        jsonResponse(200, true, $progress, 'Progreso de lecciones obtenido');
    }

    public function save(User $user): void
    {
        $this->assertStudent($user);
        $body = readJsonBody();
        $slug = (string) ($body['lesson_slug'] ?? '');
        $phase = filter_var($body['phase'] ?? null, FILTER_VALIDATE_INT);
        if (!array_key_exists($slug, self::ANSWERS) || $phase === false || $phase < 1 || $phase > 4) {
            throw new ValidationException('La lección o la fase no es válida');
        }

        $stmt = $this->db->prepare('SELECT phase FROM student_lesson_progress WHERE student_id=? AND lesson_slug=?');
        $stmt->execute([$user->id, $slug]);
        $current = (int) ($stmt->fetchColumn() ?: 0);
        $answer = null;
        if ($phase === 4) {
            $answer = filter_var($body['answer'] ?? null, FILTER_VALIDATE_INT);
            if ($current < 3 || $answer !== self::ANSWERS[$slug]) {
                throw new ValidationException('La respuesta no es correcta todavía. Repasa el ejemplo e inténtalo de nuevo.');
            }
        } elseif ($phase > $current + 1) {
            throw new ValidationException('Completa primero la fase anterior');
        }

        $next = max($current, $phase);
        $stmt = $this->db->prepare('INSERT INTO student_lesson_progress (student_id,lesson_slug,phase,quiz_answer) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE phase=GREATEST(phase,VALUES(phase)),quiz_answer=IF(VALUES(phase)=4,VALUES(quiz_answer),quiz_answer)');
        $stmt->execute([$user->id, $slug, $next, $answer]);
        jsonResponse(200, true, ['phase' => $next], 'Progreso guardado');
    }

    private function assertStudent(User $user): void
    {
        if ($user->role !== User::ROLE_STUDENT) throw new ForbiddenException('Las lecciones son solo para estudiantes');
    }
}
