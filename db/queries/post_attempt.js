const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers');

/**
 * Inserts a quiz attempt into the db
 * @param {Object} submission An object representing the quiz attempt submission
 * @param {String} userId The id of the user who attempted the quiz
 * @return {Promise} Promise resolves to the url for the attempt.
 * */
const postAttempt = function(submission, userId) {
  const url = generateRandomString(10);
  const queryAttempt = `
    INSERT INTO attempts (quiz_id, user_id, url)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  const attemptParams = [submission.quiz_id, userId, url];

  let queryAnswers = 'INSERT INTO attempt_answers (attempt_id, answer_id) VALUES';
  const queryAnswersParams = [null]; //null will be replaced with attempt_id

  submission.answerIds.forEach(id => {
    queryAnswersParams.push(id);
    queryAnswers += `
      ($1, $${queryAnswersParams.length}),`;
  });

  queryAnswers = queryAnswers.slice(0,-1) + ';';

  return db.query(queryAttempt, attemptParams)
    .then(data => {
      queryAnswersParams[0] = data.rows[0].id;
      return db.query(queryAnswers, queryAnswersParams);
    })
    .then(() => {
      return url;
    });
};

module.exports = { postAttempt };
