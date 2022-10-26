const db = require('../connection');

const getUsers = () => {
  return db.query('SELECT * FROM users;')
    .then(data => {
      return data.rows;
    });
};

const getUserById = id => {
  return db.query(`
  SELECT * FROM users
  WHERE id = $1;
  `, [id])
  .then (user => {
    return user.rows[0]
  })
  .catch(error => {
    console.log(error);
  })
}

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
    ORDER BY attempts.attempted_at DESC`

  return new Promise((res, rej) => {db.query(query, [userId])
    .then(data => res(data.rows))});

}

module.exports = { getUsers, getUserById, getAllUserAttempts };
