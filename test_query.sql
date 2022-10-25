SELECT
    quizzes.*,
    COUNT(questions.*) AS question_count,
    users.name AS author
  FROM quizzes
  LEFT JOIN questions
    ON quizzes.id = quiz_id
  JOIN users
    ON users.id = user_id
  WHERE TRUE
    AND NOT is_private
    AND quizzes.id NOT IN (SELECT attempts.quiz_id FROM attempts WHERE user_id = 2)
    GROUP BY quizzes.id, users.id;
