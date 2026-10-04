USE ready_for_the_test;

UPDATE user_customizations
SET avatar_item = NULL
WHERE avatar_item IN ('lentes', 'corona', 'orbita', 'cohete');

DELETE FROM user_avatar_items
WHERE item_id IN ('lentes', 'corona', 'orbita', 'cohete');
