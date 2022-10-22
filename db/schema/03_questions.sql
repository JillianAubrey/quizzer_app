-- Drop and recreate questions table

DROP TABLE IF EXISTS questions CASCADE;
CREATE TABLE questions (
  id SERIAL PRIMARY KEY NOT NULL,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  text TEXT,
  sequence INTEGER,
  UNIQUE(quiz_id, sequence)
);
