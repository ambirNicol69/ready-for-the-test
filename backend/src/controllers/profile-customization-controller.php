<?php

declare(strict_types=1);

final class ProfileCustomizationController
{
    private const COLORS = ['#0e8388', '#6257d9', '#c4477d', '#26734d', '#bc6b25'];
    private const ITEMS = [
        ['id' => 'conejo', 'name' => 'Conejo', 'price' => 100],
        ['id' => 'corgi', 'name' => 'Corgi', 'price' => 100],
        ['id' => 'gato', 'name' => 'Gato', 'price' => 100],
        ['id' => 'husky', 'name' => 'Husky', 'price' => 100],
        ['id' => 'nutria', 'name' => 'Nutria', 'price' => 100],
        ['id' => 'oso', 'name' => 'Oso', 'price' => 100],
        ['id' => 'oveja', 'name' => 'Oveja', 'price' => 100],
        ['id' => 'panda', 'name' => 'Panda', 'price' => 100],
        ['id' => 'pato', 'name' => 'Pato', 'price' => 100],
        ['id' => 'pingu', 'name' => 'Pingüino', 'price' => 100],
        ['id' => 'rana', 'name' => 'Rana', 'price' => 100],
        ['id' => 'tortuga', 'name' => 'Tortuga', 'price' => 100],
        ['id' => 'zorra', 'name' => 'Zorra', 'price' => 100],
    ];

    public function __construct(private readonly PDO $db) {}

    public function get(User $user): void
    {
        $stmt = $this->db->prepare('SELECT accent_color, avatar_item FROM user_customizations WHERE user_id=?');
        $stmt->execute([$user->id]);
        $settings = $stmt->fetch() ?: ['accent_color' => self::COLORS[0], 'avatar_item' => null];
        $owned = $this->ownedItems((int) $user->id);
        jsonResponse(200, true, [
            'accent_color' => $settings['accent_color'],
            'avatar_item' => $settings['avatar_item'],
            'owned_items' => $owned,
        ], 'Personalización obtenida');
    }

    public function save(User $user): void
    {
        $body = readJsonBody();
        $color = (string) ($body['accent_color'] ?? '');
        $item = $body['avatar_item'] ?? null;
        if (!in_array($color, self::COLORS, true)) {
            throw new ValidationException('El color seleccionado no está disponible');
        }
        if ($item !== null && (!is_string($item) || !in_array($item, $this->ownedItems((int) $user->id), true))) {
            throw new ValidationException('Primero debes canjear ese avatar en la tienda');
        }
        $stmt = $this->db->prepare(
            'INSERT INTO user_customizations (user_id, accent_color, avatar_item) VALUES (?, ?, ?) '
            . 'ON DUPLICATE KEY UPDATE accent_color=VALUES(accent_color), avatar_item=VALUES(avatar_item)'
        );
        $stmt->execute([$user->id, $color, $item]);
        jsonResponse(200, true, ['accent_color' => $color, 'avatar_item' => $item], 'Personalización guardada');
    }

    public function shop(User $user): void
    {
        $this->assertStudent($user);
        jsonResponse(200, true, [
            'items' => self::ITEMS,
            'owned_items' => $this->ownedItems((int) $user->id),
            'points' => $user->points,
        ], 'Tienda obtenida');
    }

    public function purchase(User $user): void
    {
        $this->assertStudent($user);
        $itemId = (string) (readJsonBody()['item_id'] ?? '');
        $item = $this->findItem($itemId);
        if ($item === null) {
            throw new ValidationException('El artículo no existe');
        }

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare('SELECT points FROM users WHERE id=? FOR UPDATE');
            $stmt->execute([$user->id]);
            $points = (int) $stmt->fetchColumn();
            if (in_array($itemId, $this->ownedItems((int) $user->id), true)) {
                throw new ValidationException('Ya tienes este artículo');
            }
            if ($points < $item['price']) {
                throw new ValidationException('No tienes puntos suficientes para este artículo');
            }
            $this->db->prepare('UPDATE users SET points=points-? WHERE id=?')->execute([$item['price'], $user->id]);
            $this->db->prepare('INSERT INTO user_avatar_items (user_id,item_id) VALUES (?,?)')->execute([$user->id, $itemId]);
            $this->db->commit();
        } catch (Throwable $error) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $error;
        }
        jsonResponse(200, true, ['item_id' => $itemId, 'points' => $points - $item['price']], 'Artículo canjeado');
    }

    private function ownedItems(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT item_id FROM user_avatar_items WHERE user_id=?');
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(), 'item_id');
    }

    private function findItem(string $id): ?array
    {
        foreach (self::ITEMS as $item) {
            if ($item['id'] === $id) return $item;
        }
        return null;
    }

    private function assertStudent(User $user): void
    {
        if ($user->role !== User::ROLE_STUDENT) {
            throw new ForbiddenException('La tienda de avatar solo está disponible para estudiantes');
        }
    }
}
