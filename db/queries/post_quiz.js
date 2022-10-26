const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers');

const addQuiz = function(userId, content, userName) {
  let quizTitle = '';
  let quizDescription = '';
  let quizPrivate = 'TRUE';
  let url = generateRandomString(10);
  let resultsUrl = generateRandomString(10);
  let quizInfo;

  const quizzesQuery = `
    INSERT INTO quizzes(user_id, title, description, url, results_url, is_private)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

  for (let key in content) {
    if (key === "quiz_title") {
      quizTitle = content[key];
    }

    if (key === "quiz_description") {
      quizDescription = content[key];
    }

    if (key === "quiz_private") {
      quizPrivate = content[key];
    }
  }

  return db.query(quizzesQuery, [userId, quizTitle, quizDescription, url, resultsUrl, quizPrivate])
    .then((quizData) => addQuestions(quizData.rows[0].id, content))
    .then((questionData) => addAnswers(questionData, content))
    .then(() => {
      return { quizTitle, quizDescription, url, resultsUrl, quizPrivate, userName };
    })
    .catch(error => console.log(error));
};

const addQuestions = function(quizId, content) {
  let queryParams = [];
  let queryCount = 1;

  let questionQuery = `
    INSERT INTO questions(quiz_id, text, sequence) VALUES `;

  for (let key in content) {
    if (key.length === 1) {
      queryParams.push(`${quizId}`, content[key], key);
      questionQuery += `($${queryCount}, $${queryCount + 1}, $${queryCount + 2}),`;
      queryCount += 3;
    }
  }

  questionQuery = questionQuery.slice(0, -1);
  questionQuery += ' RETURNING *;';

  return db.query(questionQuery, queryParams)
    .then(data => data.rows);
};

const addAnswers = function(questions, content) {
  let ansQuery = `INSERT INTO answers(question_id, text, is_correct) VALUES `;
  let queryCount = 1;
  let queryParams = [];
  let answers = [];

  questions.forEach((question) => {


    for (let key in content) {
      if (key[key.length - 1] === 'a') {
        if (!answers.includes(content[key])) {
          answers.push(content[key]);
        }
      }
    }

    for (let key in content) {
      if (key.length >= 3 && key !== 'quiz_title' && key !== 'quiz_description' && key !== 'quiz_private') {

        let quesAndAns = key.split('-');

        if (quesAndAns[1] !== 'a' && Number(quesAndAns[0]) === question.sequence) {

          ansQuery += `($${queryCount}, $${queryCount + 1}, $${queryCount + 2}),`;
          queryParams.push(question.id, content[key]);

          if (answers.includes(key)) {
            queryParams.push('TRUE');
          } else {
            queryParams.push('FALSE');
          }

          queryCount += 3;

        }
      }
    }
  });

  ansQuery = ansQuery.slice(0, -1);
  ansQuery += 'RETURNING*;';

  return db.query(ansQuery, queryParams);
};

module.exports = {addQuiz, addAnswers, addQuestions};
