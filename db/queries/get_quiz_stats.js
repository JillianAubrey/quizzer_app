const db = require('../connection');

const getQuizResults = function({results_url, id}) {
  const queryQuizId = `
    SELECT id
    FROM quizzes
    WHERE ${results_url ? 'results_url' : 'id'} = $1
  `;

  const queryCounts = `
  SELECT COUNT(DISTINCT attempts.user_id) AS attempters,
    COUNT(DISTINCT attempts.id) AS attempts,
    COUNT (DISTINCT questions.id) AS questions
  FROM attempts
  JOIN quizzes ON
    quizzes.id = attempts.quiz_id
  JOIN questions ON
    quizzes.id = questions.quiz_id
  WHERE quizzes.id = $1
  `;

  const queryAverageScore = `
  SELECT AVG(score) AS average
  FROM (
    SELECT COUNT(*) AS score
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE is_correct
      AND attempts.quiz_id = $1
    GROUP BY attempts.id
  ) AS scores
  `;

  const queryByAttempt = `
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

  const queryByAnswer = `
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

  return db.query(queryQuizId, [results_url || id])
    .then(data => data.rows[0].id)
    .then(quizId => {
      return Promise.all([
        quizId,
        db.query(queryCounts, [quizId])
          .then(data => data.rows[0]),
        db.query(queryAverageScore, [quizId])
          .then(data => Number(data.rows[0].average)),
        db.query(queryByAttempt, [quizId])
          .then(data => {
            data.rows.forEach((row) => {
              row.attempted_at = new Date(row.attempted_at).toISOString();
            });
            return data.rows;
          }),
        db.query(queryByAnswer, [quizId])
          .then(data => {
            return data.rows.reduce((byAnswer, row) => {
              byAnswer[row.id] = row;
              return byAnswer;
            }, {});
          }
          ),
      ]);
    })
    .then(([quizId, {attempters, attempts, questions}, average, byAttempt, byAnswer]) => {
      return {
        quizId,
        attempters,
        attempts,
        questions,
        average,
        byAttempt,
        byAnswer,
      };
    })
    .catch(error => console.log(error));
};

const getQuizAverage = function(quizId) {
  query = `SELECT AVG(score) AS average
    FROM (
      SELECT COUNT(*) AS score, attempts.user_id
      FROM attempts
      JOIN attempt_answers
        ON attempts.id = attempt_id
      JOIN answers
        ON answers.id = answer_id
      WHERE is_correct
        AND attempts.quiz_id = $1
      GROUP BY attempts.id
    ) AS scores;`;

  return new Promise((res, rej) => {
    db.query(query, [quizId])
      .then((result) => {
        return res([quizId, result.rows[0]]);
      })
      .catch(error => console.log(error));
  });
};

const getNumOfAttemptsQuiz = function(quizId) {
  let query = `SELECT COUNT(DISTINCT attempts.id) AS attempts
    FROM attempts
    JOIN quizzes
    ON attempts.quiz_id = quizzes.id
    WHERE quiz_id = $1;`;

  return new Promise((res, rej) => {
    db.query(query, [quizId])
      .then((result) => {
        return res([quizId, result.rows[0]]);
      })
      .catch(error => console.log(error));
  });
};

module.exports = { getQuizResults, getQuizAverage, getNumOfAttemptsQuiz };
