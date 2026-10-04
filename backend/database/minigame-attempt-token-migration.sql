USE ready_for_the_test;

ALTER TABLE minigame_attempts
  ADD COLUMN attempt_token CHAR(36) NULL AFTER id;

UPDATE minigame_attempts
SET attempt_token = UUID()
WHERE attempt_token IS NULL;

ALTER TABLE minigame_attempts
  MODIFY attempt_token CHAR(36) NOT NULL,
  ADD UNIQUE KEY unique_minigame_attempt_token (attempt_token);
