USE ready_for_the_test;

CREATE TABLE IF NOT EXISTS student_lesson_progress (
  student_id INT NOT NULL,
  lesson_slug VARCHAR(40) NOT NULL,
  phase TINYINT UNSIGNED NOT NULL DEFAULT 0,
  quiz_answer SMALLINT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, lesson_slug),
  CONSTRAINT fk_lesson_progress_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
