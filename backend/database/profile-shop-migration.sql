USE ready_for_the_test;

CREATE TABLE IF NOT EXISTS user_customizations (
  user_id INT NOT NULL PRIMARY KEY,
  accent_color CHAR(7) NOT NULL DEFAULT '#0e8388',
  avatar_item VARCHAR(30) NULL,
  CONSTRAINT fk_customization_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_avatar_items (
  user_id INT NOT NULL,
  item_id VARCHAR(30) NOT NULL,
  purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  CONSTRAINT fk_avatar_item_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
