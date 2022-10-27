const db = require('../connection');

const getQuizResults = function(results_url) {
  const queryQuizId = `
    SELECT id
    FROM quizzes
    WHERE results_url = $1
  `;

  return db.query(queryQuizId, [results_url])
    .then(data => data.rows[0].id)
    .then(quizId => {
      return Promise.all([
        quizId,
        getQuizOverallStats(quizId),
        getQuizStatsByAttempt(quizId),
        getQuizStatsByAnswer(quizId),
      ])
      .catch(error => console.log(error));
    })
    .then(([quizId, {attempts, questions, avg_score}, byAttempt, byAnswer]) => {
      const results = {
        quizId,
        attempts,
        questions,
        avg_score,
        byAttempt,
        byAnswer,
      };
      console.log(results);
      return results;
    })
    .catch(error => console.log(error));
};

const getQuizOverallStats = quizId => {
  const query = `
  SELECT
    COUNT (DISTINCT attempts.id) AS attempts,
    COUNT (DISTINCT questions.id) AS questions,
    AVG(score) AS avg_score
  FROM attempts
  JOIN quizzes ON
    quizzes.id = attempts.quiz_id
  JOIN questions ON
    quizzes.id = questions.quiz_id
  LEFT JOIN (
    SELECT COUNT(*) AS score,quiz_id
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE is_correct
      AND attempts.quiz_id = $1
    GROUP BY attempts.id
  ) scores
    ON scores.quiz_id = quizzes.id
  WHERE quizzes.id = $1
  `;

  return db.query(query, [quizId])
  .then(data => data.rows[0])
  .catch(error => console.log(error));

}

const getQuizStatsByAnswer = quizId => {
  const query = `
  SELECT answers.id, is_correct,
    COUNT(attempt_answers.*) AS count
  FROM answers
  JOIN questions
    ON questions.id = question_id
  JOIN quizzes
    ON quizzes.id = questions.quiz_id
  LEFT JOIN attempt_answers
    ON answers.id = answer_id
  LEFT JOIN attempts
    ON attempts.id = attempt_id
  WHERE quizzes.id = $1
  GROUP BY answers.id
  `;

  return db.query(query, [quizId])
  .then(data => {
      return data.rows.reduce((byAnswer, row) => {
        byAnswer[row.id] = row;
        return byAnswer;
      }, {});
    })
    .catch(error => console.log(error));
}

const getQuizStatsByAttempt = quizId => {
  const query = `
  SELECT users.name, attempts.url, attempted_at,
    COUNT(*) filter (where "is_correct") AS score
  FROM attempts
  LEFT JOIN attempt_answers
    ON attempts.id = attempt_id
  JOIN answers
    ON answers.id = answer_id
  LEFT JOIN users
    ON attempts.user_id = users.id
  WHERE attempts.quiz_id = $1
  GROUP BY users.id, attempts.id
  ORDER BY attempted_at DESC
  `;

  return db.query(query, [quizId])
  .then(data => {
    data.rows.forEach((row) => {
      row.attempted_at = new Date(row.attempted_at).toISOString();
    });
    return data.rows;
  })
  .catch(error => console.log(error));
}

module.exports = { getQuizResults };
