-- Drop and recreate attempt_answers table

DROP TABLE IF EXISTS attempt_answers CASCADE;
CREATE TABLE attempt_answers (
  id SERIAL PRIMARY KEY NOT NULL,
  attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE
);
