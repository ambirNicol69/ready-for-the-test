USE ready_for_the_test;

CREATE TABLE IF NOT EXISTS minigame_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_token CHAR(36) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  game_code VARCHAR(40) NOT NULL,
  score SMALLINT UNSIGNED NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_minigame_user_game (user_id, game_code),
  CONSTRAINT fk_minigame_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
