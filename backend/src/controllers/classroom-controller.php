<?php

declare(strict_types=1);

final class ClassroomController
{
    public function __construct(private readonly PDO $db) {}

    public function list(User $user): void
    {
        if ($user->role === User::ROLE_TEACHER) {
            $stmt = $this->db->prepare('SELECT c.*, (SELECT COUNT(*) FROM classroom_students cs WHERE cs.classroom_id=c.id) student_count FROM classrooms c WHERE c.teacher_id=? ORDER BY c.created_at DESC');
            $stmt->execute([$user->id]);
        } else {
            $stmt = $this->db->prepare('SELECT c.*, 0 student_count FROM classrooms c JOIN classroom_students cs ON cs.classroom_id=c.id WHERE cs.student_id=? ORDER BY c.created_at DESC');
            $stmt->execute([$user->id]);
        }
        $classes = $stmt->fetchAll();
        foreach ($classes as &$class) {
            $query = $this->db->prepare('SELECT a.*, (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id=a.id) submission_count, s.id submission_id, s.grade, s.feedback FROM assignments a LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=? WHERE a.classroom_id=? ORDER BY a.created_at DESC');
            $query->execute([$user->id, $class['id']]);
            $class['assignments'] = array_map(fn($a) => $this->assignmentPayload($a, $user->role), $query->fetchAll());
        }
        jsonResponse(200, true, $classes, 'Salones obtenidos');
    }

    public function create(User $user): void
    {
        $this->teacher($user);
        $body = readJsonBody(); $name = trim((string) ($body['name'] ?? ''));
        if ($name === '' || mb_strlen($name) > 120) throw new ValidationException('El nombre debe tener entre 1 y 120 caracteres');
        $code = strtoupper(bin2hex(random_bytes(3)));
        $stmt = $this->db->prepare('INSERT INTO classrooms (teacher_id,name,join_code) VALUES (?,?,?)');
        $stmt->execute([$user->id, $name, $code]);
        jsonResponse(201, true, ['id' => (int) $this->db->lastInsertId(), 'name' => $name, 'join_code' => $code, 'student_count' => 0, 'assignments' => []], 'Salón creado');
    }

    public function addStudent(User $user, int $classId): void
    {
        $this->teacher($user); $this->ownedClass($classId, $user->id);
        $body = readJsonBody(); $email = strtolower(trim((string) ($body['email'] ?? '')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new ValidationException('Escribe un correo válido');
        $stmt = $this->db->prepare("SELECT id, role FROM users WHERE email=?"); $stmt->execute([$email]); $student = $stmt->fetch();
        if (!$student || $student['role'] !== User::ROLE_STUDENT) throw new NotFoundException('No existe un estudiante registrado con ese correo');
        $stmt = $this->db->prepare('INSERT IGNORE INTO classroom_students (classroom_id,student_id) VALUES (?,?)'); $stmt->execute([$classId, $student['id']]);
        jsonResponse(200, true, null, $stmt->rowCount() ? 'Estudiante añadido al salón' : 'El estudiante ya pertenece al salón');
    }

    public function createAssignment(User $user, int $classId): void
    {
        $this->teacher($user); $this->ownedClass($classId, $user->id);
        $title = trim((string) ($_POST['title'] ?? '')); $instructions = trim((string) ($_POST['instructions'] ?? ''));
        if ($title === '' || mb_strlen($title) > 160) throw new ValidationException('Escribe un título (máximo 160 caracteres)');
        $file = isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE ? $this->saveUpload($_FILES['file']) : null;
        if ($file === null && $instructions === '') throw new ValidationException('Añade instrucciones o adjunta un archivo');
        $due = trim((string) ($_POST['due_at'] ?? '')) ?: null;
        $stmt = $this->db->prepare('INSERT INTO assignments (classroom_id,title,instructions,file_path,file_name,due_at) VALUES (?,?,?,?,?,?)');
        $stmt->execute([$classId, $title, $instructions, $file['path'] ?? null, $file['name'] ?? null, $due]);
        jsonResponse(201, true, ['id' => (int) $this->db->lastInsertId()], 'Asignación publicada');
    }

    public function submit(User $user, int $assignmentId): void
    {
        $this->student($user); $assignment = $this->findAssignment($assignmentId);
        $stmt = $this->db->prepare('SELECT 1 FROM classroom_students WHERE classroom_id=? AND student_id=?'); $stmt->execute([$assignment['classroom_id'], $user->id]);
        if (!$stmt->fetchColumn()) throw new ForbiddenException('No perteneces a este salón');
        if (empty($_FILES['file'])) throw new ValidationException('Adjunta tu trabajo');
        $file = $this->saveUpload($_FILES['file']);
        $stmt = $this->db->prepare('INSERT INTO assignment_submissions (assignment_id,student_id,file_path,file_name) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE file_path=VALUES(file_path),file_name=VALUES(file_name),submitted_at=CURRENT_TIMESTAMP,grade=NULL,feedback=NULL,graded_at=NULL');
        $stmt->execute([$assignmentId, $user->id, $file['path'], $file['name']]);
        jsonResponse(201, true, null, 'Trabajo entregado');
    }

    public function submissions(User $user, int $assignmentId): void
    {
        $this->teacher($user); $assignment = $this->findAssignment($assignmentId); $this->ownedClass((int) $assignment['classroom_id'], $user->id);
        $stmt = $this->db->prepare('SELECT s.*,u.full_name student_name FROM assignment_submissions s JOIN users u ON u.id=s.student_id WHERE s.assignment_id=? ORDER BY s.submitted_at DESC'); $stmt->execute([$assignmentId]);
        $rows = array_map(fn($r) => $this->filePayload($r), $stmt->fetchAll());
        jsonResponse(200, true, $rows, 'Entregas obtenidas');
    }

    public function grade(User $user, int $submissionId): void
    {
        $this->teacher($user); $body = readJsonBody(); $grade = $body['grade'] ?? null; $feedback = trim((string) ($body['feedback'] ?? ''));
        if (!is_numeric($grade) || (float) $grade < 0 || (float) $grade > 100) throw new ValidationException('La calificación debe estar entre 0 y 100');
        $stmt = $this->db->prepare('SELECT a.classroom_id FROM assignment_submissions s JOIN assignments a ON a.id=s.assignment_id WHERE s.id=?'); $stmt->execute([$submissionId]); $classId = $stmt->fetchColumn();
        if (!$classId) throw new NotFoundException('Entrega no encontrada'); $this->ownedClass((int) $classId, $user->id);
        $stmt = $this->db->prepare('UPDATE assignment_submissions SET grade=?,feedback=?,graded_at=NOW() WHERE id=?'); $stmt->execute([$grade, $feedback, $submissionId]);
        jsonResponse(200, true, null, 'Corrección guardada');
    }

    private function assignmentPayload(array $a, string $role): array
    {
        $a['id'] = (int) $a['id']; $a['submission_count'] = (int) ($a['submission_count'] ?? 0);
        $a['file_url'] = $a['file_path'] ? '/' . $a['file_path'] : null;
        $a['submitted'] = $a['submission_id'] !== null; $a['grade'] = $a['grade'] === null ? null : (float) $a['grade'];
        if ($role === User::ROLE_STUDENT) { unset($a['submission_count'], $a['submission_id']); }
        return $a;
    }

    private function filePayload(array $row): array { $row['file_url'] = '/' . $row['file_path']; $row['grade'] = $row['grade'] === null ? null : (float) $row['grade']; return $row; }
    private function findAssignment(int $id): array { $stmt = $this->db->prepare('SELECT * FROM assignments WHERE id=?'); $stmt->execute([$id]); $row = $stmt->fetch(); if (!$row) throw new NotFoundException('Asignación no encontrada'); return $row; }
    private function ownedClass(int $id, int $teacherId): array { $stmt = $this->db->prepare('SELECT * FROM classrooms WHERE id=? AND teacher_id=?'); $stmt->execute([$id, $teacherId]); $row = $stmt->fetch(); if (!$row) throw new NotFoundException('Salón no encontrado'); return $row; }
    private function teacher(User $user): void { if ($user->role !== User::ROLE_TEACHER) throw new ForbiddenException('Esta acción es solo para docentes'); }
    private function student(User $user): void { if ($user->role !== User::ROLE_STUDENT) throw new ForbiddenException('Esta acción es solo para estudiantes'); }

    private function saveUpload(array $upload): array
    {
        if ($upload['error'] !== UPLOAD_ERR_OK || $upload['size'] > 15 * 1024 * 1024) throw new ValidationException('El archivo no es válido o supera 15 MB');
        $extension = strtolower(pathinfo($upload['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf','doc','docx','ppt','pptx','xls','xlsx','jpg','jpeg','png','webp'];
        if (!in_array($extension, $allowed, true) || !is_uploaded_file($upload['tmp_name'])) throw new ValidationException('Formato no permitido. Usa PDF, Office o una imagen.');
        $directory = dirname(__DIR__, 3) . '/frontend/uploads/classes';
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) throw new RuntimeException('No se pudo preparar el almacenamiento de archivos');
        $name = bin2hex(random_bytes(16)) . '.' . $extension; $target = $directory . '/' . $name;
        if (!move_uploaded_file($upload['tmp_name'], $target)) throw new RuntimeException('No se pudo guardar el archivo');
        return ['path' => 'uploads/classes/' . $name, 'name' => basename($upload['name'])];
    }
}
