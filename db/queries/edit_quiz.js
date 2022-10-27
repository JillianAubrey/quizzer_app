const db = require('../connection'); //connect to DB

const checkUserPermission = function(userId, quizUrl) {
  let query = `
    SELECT quizzes.id
    FROM quizzes
    JOIN users
    ON quizzes.user_id = users.id
    WHERE users.id = $1
    AND quizzes.url = $2`;

  return db.query(query, [userId, quizUrl])
  .then((data) => {
    if (data.rows.length) {
      return true;
    }
    return false;
  })
  .catch(error => console.log(error));
};

const changePrivacy = function(quizUrl, request) {
  let private;

  if (request === 'Private') {
    private = true;
  }
  if (request === 'Public') {
    private = false;
  }

  const query = `
    UPDATE quizzes
    SET is_private = $1
    WHERE url = $2`;

  return db.query(query, [private, quizUrl])
    .then(() => {
      return true;
    })
    .catch(error => console.log(error));
};

const deleteQuiz = function(quizUrl) {

  const query = `
    DELETE FROM quizzes WHERE url = $1;
    `;

  return db.query(query, [quizUrl])
    .then(() => {
      return true;
    })
    .catch(error => console.log(error));
};

module.exports = { checkUserPermission, changePrivacy, deleteQuiz };
