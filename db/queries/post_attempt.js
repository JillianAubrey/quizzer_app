const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers');

const postAttempt = function(submission, user_id) {
  const url = generateRandomString(10);
  const queryAttempt = `
    INSERT INTO attempts (quiz_id, user_id, url)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  const attemptParams = [submission.quiz_id, user_id, url];

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
