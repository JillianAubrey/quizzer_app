const db = require('../connection'); //connect to DB

/**
   * Checks to see if user is owner of quiz
   * @param {String} userId Id of the user to test for ownership
   * @param {String} quizId Id of the quiz to test for ownership
   * @return {Promise} Promise that resolves to true or false. True means the user owns the quiz, and false means that they don't
   */
const checkUserPermission = function(userId, quizId) {
  let query = `
    SELECT quizzes.id
    FROM quizzes
    WHERE user_id = $1
    AND id = $2`;

  return db.query(query, [userId, quizId])
    .then((data) => {
      if (data.rows.length) {
        return true;
      }
      return false;
    })
    .catch(error => console.log(error));
};

/**
 * Changes privacy of quiz
 * @param {String} quizId Id of the quiz to change privacy of
 * @param {String} request If 'Private' will make quiz private, otherwise will make it public
 * @return {Promise}
 * */
const changePrivacy = function(quizId, request) {
  const query = `
    UPDATE quizzes
    SET is_private = $1
    WHERE id = $2`;

  return db.query(query, [(request === 'Private'), quizId])
    .catch(error => console.log(error));
};

/**
 * Deletes quiz
 * @param {String} quizId Id of the quiz to delete
 * @return {Promise}
 * */
const deleteQuiz = function(quizId) {
  const query = `
    DELETE FROM quizzes WHERE id = $1;
    `;

  return db.query(query, [quizId])
    .catch(error => console.log(error));
};

module.exports = { checkUserPermission, changePrivacy, deleteQuiz };
