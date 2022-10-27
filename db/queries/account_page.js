const db = require('../connection');

/*
quiz id
quiz title
quiz description
url
creation_date (as iso string)
average score
question count
attempt count
*/

const getAccountQuizzes = (userId) => {
  const query = `
  SELECT quizzes.id AS quiz_id, title, quizzes.url,quizzes.results_url, created_at, is_private,
    AVG(score) AS avg_score,
    COUNT(DISTINCT attempts.id) AS attempts,
    COUNT(DISTINCT questions.id) AS questions
  FROM quizzes
  LEFT JOIN (
    SELECT COUNT(*) AS score, quiz_id
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE is_correct
    GROUP BY attempts.id
  ) scores
    ON quizzes.id = scores.quiz_id
  LEFT JOIN attempts
    ON quizzes.id = attempts.quiz_id
  LEFT JOIN questions
    ON quizzes.id = questions.quiz_id
  WHERE quizzes.user_id = $1
  GROUP BY quizzes.id
  ORDER BY created_at DESC
  `

return db.query(query, [userId])
.then(data => {
  // console.log(data.rows);
  data.rows.forEach(row => row.created_at = new Date(row.created_at).toISOString);
  return data.rows;
})
.catch(error => console.log(error));
}

/*
attempt url
attempt date
quiz link
score
num of questions
*/

const getAccountAttempts = userId => {
  const query = `
    SELECT attempts.url AS attempt_url, attempted_at,
      quizzes.url AS quiz_url, quizzes.title,
      COUNT (DISTINCT questions.id) AS questions,
      COUNT (DISTINCT attempt_answers.id) filter (where "is_correct") AS score
    FROM attempts
    JOIN quizzes
      ON quizzes.id = attempts.quiz_id
    JOIN questions
      ON quizzes.id = questions.quiz_id
    LEFT JOIN attempt_answers
      ON attempts.id = attempt_id
    LEFT JOIN answers
      ON answers.id = answer_id
    WHERE attempts.user_id = $1
    GROUP BY attempts.id, quizzes.id
    ORDER BY attempted_at DESC
  `

  return db.query(query, [userId])
  .then(data => {
    // console.log(data.rows);
    data.rows.forEach(row => row.attempted_at = new Date(row.attempted_at).toISOString);
    return data.rows;
  })
  .catch(error => console.log(error));
}

module.exports =  { getAccountQuizzes, getAccountAttempts }


