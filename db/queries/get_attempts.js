const db = require('../connection');

const getAttempt = function({url, id}) {
  const query = `
      SELECT quiz_id, user_id,
        users.name AS attempter,
        attempt_answers.answer_id,
        is_correct
      FROM attempts
      LEFT JOIN users
        ON users.id = user_id
      LEFT JOIN attempt_answers
        ON attempts.id = attempt_id
      JOIN answers
        ON answers.id = answer_id
      WHERE ${url ? 'url' : 'attempts.id'} = $1;
    `;
  return db.query(query, [url || id])
    .then(data => {
      const {quiz_id, user_id, attempter} = data.rows[0];
      const attempt = {
        quiz_id,
        user_id,
        attempter,
        answers:{}
      };
      const answers = attempt.answers;
      data.rows.forEach(row => {
        const { answer_id, is_correct} = row;
        const answer = {
          id: answer_id,
          is_correct
        };
        answers[answer_id] = answer;
      });
      return attempt;
    })
    .catch(error => console.log(error));;
};

const getAttemptScore = function({url, id}) {
  queryCorrect = `
    SELECT COUNT(*) filter (where "is_correct") AS correct
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE ${url ? 'url' : 'attempts.id'} = $1;
  `;
  queryTotal = `
    SELECT COUNT(questions.*) AS total
    FROM attempts
    JOIN quizzes
      ON quizzes.id = attempts.quiz_id
    JOIN questions
      ON quizzes.id = questions.quiz_id
    WHERE ${url ? 'attempts.url' : 'attempts.id'} = $1;
  `;

  return new Promise((res, rej) => {
    Promise.all([
      db.query(queryCorrect, [url || id]),
      db.query(queryTotal, [url || id]),
    ])
    .then(([correct, total]) => {
      const score = {
        correct: correct.rows[0].correct,
        total: total.rows[0].total
      };
      return res(score);
    })
    .catch(error => console.log(error));;
  });
};

const getAllUserAttempts = function(userId) {

  let query = `SELECT quizzes.id AS quizId, quizzes.title as quizTitle, quizzes.url as quizUrl, attempts.id as attemptid,
    attempts.url as attemptUrl, attempts.attempted_at, COUNT(questions.*) as questionCount
    FROM attempts
    JOIN quizzes
    ON quizzes.id = attempts.quiz_id
    JOIN users on users.id = attempts.user_id
    JOIN questions ON questions.quiz_id = quizzes.id
    WHERE attempts.user_id = $1
    GROUP BY quizzes.id, attempts.url, attempts.attempted_at, attempts.id
    ORDER BY attempts.attempted_at DESC`;

  return new Promise((res, rej) => {
    db.query(query, [userId])
    .then(data => res(data.rows))
    .catch(error => console.log(error));;
  });

};

module.exports = { getAttempt, getAttemptScore, getAllUserAttempts };
