const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers');

/**
 * Inserts a quiz into the db
 * @param {Object} quiz An object representing the quiz
 * @param {String} userId The id of the user who created th quiz
 * @return {Promise} Promise resolves to an object containing the quiz's url and results_url.
 * */
const addQuiz = function(quiz, userId) {
  const {quiz_title, quiz_description, quiz_private, questions} = quiz;
  const url = generateRandomString(10);
  const resultsUrl = generateRandomString(10);
  const urls = { url, resultsUrl };

  const quizQuery = `
    INSERT INTO quizzes(user_id, title, description, url, results_url, is_private)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const queryParams = [userId, quiz_title, quiz_description, url, resultsUrl, quiz_private];

  return db.query(quizQuery, queryParams)
    .then((quizData) => quizData.rows[0].id)
    .then(quizId => addQuestions(quizId, questions))
    .then(questionInfo => addAnswers(questionInfo, questions))
    .then(() => urls)
    .catch(error => console.log(error));
};

/**
 * Inserts questions for a new quiz into the db
 * @param {String} quizId The id of the quiz that the questions belong to
 * @param {Object} questions An object representing the questions to insert, keyed with their sequence numbers
 * @return {Promise} Promise resolves to questionInfo object which has key value pairs of question sequence num: question id. Used to insert answers to db.
 * */
const addQuestions = function(quizId, questions) {
  let queryParams = [quizId];

  let query = `
    INSERT INTO questions(quiz_id, text, sequence) VALUES `;

  for (const seqNum in questions) {
    const text = questions[seqNum].text;
    query += ` ($1, `;
    queryParams.push(text);
    query += `$${queryParams.length}, `;
    queryParams.push(seqNum);
    query += `$${queryParams.length}),`;
  }

  query = query.slice(0, -1);
  query += ' RETURNING *';

  return db.query(query, queryParams)
    .then(data => {
      return data.rows.reduce((questionInfo, question) => {
        questionInfo[question.sequence] = question.id;
        return questionInfo;
      }, {});
    })
    .catch(error => console.log(error));
};

/**
 * Inserts answers for a new quiz into the db
 * @param {Object} questionInfo Object which has key value pairs of question sequence num: question id
 * @param {Object} questions An object representing the questions to insert, asnwers are a parameter of each question.
 * @return {Promise}
 * */
const addAnswers = function(questionInfo, questions) {
  let query = `INSERT INTO answers(question_id, text, is_correct) VALUES `;
  let queryParams = [];

  for (const seqNum in questions) {
    const question = questions[seqNum];
    const quesId = questionInfo[seqNum];
    queryParams.push(quesId);
    const quesIdPos = queryParams.length;

    for (const ansNum in question.answers) {
      const text = question.answers[ansNum];
      const isCorrect = (ansNum === question.correct);
      query += ` ($${quesIdPos}, `;
      queryParams.push(text);
      query += `$${queryParams.length}, `;
      queryParams.push(isCorrect);
      query += `$${queryParams.length}),`;
    }
  }

  query = query.slice(0, -1);

  return db.query(query, queryParams)
    .catch(error => console.log(error));
};

module.exports = { addQuiz };
