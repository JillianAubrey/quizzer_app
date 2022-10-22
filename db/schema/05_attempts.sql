-- Drop and recreate attempts table

DROP TABLE IF EXISTS attempts CASCADE;
CREATE TABLE attempts (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  attempted_at TIMESTAMP DEFAULT NOW(),
  url VARCHAR(10)
);
