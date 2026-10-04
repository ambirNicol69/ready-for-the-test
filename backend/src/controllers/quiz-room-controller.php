<?php

declare(strict_types=1);

final class QuizRoomController
{
    public function __construct(
        private readonly QuizRoomService $service,
        private readonly QuizAutoService $autoService
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
        $result = $this->service->joinRoom($user->id, trim($requestBody['code'] ?? ''));

        jsonResponse(201, true, $result, 'Sala abierta');
    }

    public function submit(User $user): void
    {
        $this->assertStudent($user);
        $requestBody = readJsonBody();
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
