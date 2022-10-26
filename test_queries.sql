SELECT COUNT(DISTINCT attempts.id) AS attempts
FROM attempts
JOIN quizzes
ON attempts.quiz_id = quizzes.id
WHERE quiz_id = 1;
