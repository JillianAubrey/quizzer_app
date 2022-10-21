-- Drop and recreate quizzes table

DROP TABLE IF EXISTS quizzes CASCADE;
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  url VARCHAR(10) UNIQUE,
  results_url VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  is_private BOOLEAN DEFAULT TRUE
);
