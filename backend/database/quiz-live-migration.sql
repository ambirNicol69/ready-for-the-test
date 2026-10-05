USE ready_for_the_test;

ALTER TABLE quiz_rooms
  ADD COLUMN live_status ENUM('disabled', 'waiting', 'question', 'reveal', 'paused', 'finished') NOT NULL DEFAULT 'disabled' AFTER status,
  ADD COLUMN question_time_seconds SMALLINT UNSIGNED NOT NULL DEFAULT 20 AFTER live_status,
  ADD COLUMN current_question_index SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER question_time_seconds,
  ADD COLUMN question_started_at DATETIME(6) NULL AFTER current_question_index,
  ADD COLUMN question_deadline_at DATETIME(6) NULL AFTER question_started_at,
  ADD COLUMN reveal_until DATETIME(6) NULL AFTER question_deadline_at,
  ADD COLUMN paused_remaining_ms INT UNSIGNED NULL AFTER reveal_until,
  ADD COLUMN live_started_at DATETIME(6) NULL AFTER paused_remaining_ms,
  ADD COLUMN live_finished_at DATETIME(6) NULL AFTER live_started_at;

CREATE TABLE IF NOT EXISTS quiz_live_players (
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  attempt_id INT NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id),
  UNIQUE KEY unique_live_attempt (attempt_id),
  CONSTRAINT fk_live_player_room FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_live_player_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_live_player_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_live_answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  option_position SMALLINT UNSIGNED NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  response_time_ms INT UNSIGNED NOT NULL,
  points_awarded INT UNSIGNED NOT NULL DEFAULT 0,
  answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_live_answer (attempt_id, question_id),
  INDEX idx_live_answer_question (question_id),
  CONSTRAINT fk_live_answer_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_live_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);
