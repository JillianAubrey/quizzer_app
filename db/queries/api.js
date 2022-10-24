//file for API queries (may share some functionality with db/users.js but trying to modularize).

const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers')



const getQuizzes = function(options) {
  let query = `
  SELECT
    quizzes.*,
    COUNT(questions.*) AS question_count,
    users.name AS author
  FROM quizzes
  LEFT JOIN questions
    ON quizzes.id = quiz_id
  JOIN users
    ON users.id = user_id
  WHERE TRUE
  `; // WHERE TRUE initiates the WHERE so the filter options can be added with AND

  if (options.public) {
    query += ' AND NOT is_private';
  }

  query += ' GROUP BY quizzes.id, users.id;'

  return db.query(query, [])
  .then (data => {
    return data.rows;
  })
  .catch(error => {
    console.log(error);
  })
}

const getQuizByUrl = function(url) {
  const query = `
    SELECT title, description,
      users.name AS author,
      questions.text AS question,
      questions.sequence AS question_num,
      answers.text AS answer,
      answers.id AS answer_id
    FROM quizzes
    JOIN users
      ON users.id = user_id
    JOIN questions
      ON quizzes.id = quiz_id
    JOIN answers
      ON questions.id = question_id
    WHERE url = $1
    ORDER BY question_num;
  `
  return db.query(query, [url])
  .then(data => {
    const quiz = {
      title: data.rows[0].title,
      description: data.rows[0].description,
      author: data.rows[0].author,
      questions: {}
    };

    let question;
    data.rows.forEach(row => {
      if (!quiz.questions[row.question_num]) {
        quiz.questions[row.question_num] = {
          num: row.question_num,
          text: row.question,
          answers: []
        }
        question = quiz.questions[row.question_num];
      }
      question.answers.push({id: row.answer_id, text: row.answer});
    });
    console.log(quiz);
    return quiz;
  })
};

const addQuiz = function(userId, content) {
  let quizTitle = '';
  let quizDescription = '';
  let quizPrivate = 'TRUE';
  let url = generateRandomString(10);
  let resultsUrl = generateRandomString(10);

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
    .then((ansData) => addAnswers(ansData))
   // .then((answerData))
}

const addQuestions = function(quizId, content) {
  let queryParams = [];
  let queryCount = 1;

  let questionQuery = `
    INSERT INTO questions(quiz_id, text, sequence) VALUES `

  for (let key in content) {
    if (key.length === 1) {
      queryParams.push(`${quizId}`, content[key], key);
      console.log('query params: ', queryParams)
      questionQuery += `($${queryCount}, $${queryCount + 1}, $${queryCount + 2}),`;
      queryCount += 3;
    }
  }

  questionQuery = questionQuery.slice(0, -1);
  questionQuery += ' RETURNING *;';

  console.log(questionQuery);

  return db.query(questionQuery, queryParams)
    .then(data => data.rows);
}

const addAnswers = function(questions, content) {
  
}

//information needed:
//quizzes
// user_id
// title
// description
//url
//results_url
//created_at (default now())
//is_private (default true)

//questions
//quiz_id
//text
//sequence

//answers
//question_id
//text
//is_correct


module.exports = { getQuizzes, getQuizByUrl, addQuiz };
