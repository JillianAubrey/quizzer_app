//file for API queries (may share some functionality with db/users.js but trying to modularize).

const db = require('../connection'); //connect to DB



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


module.exports = { getQuizzes, getQuizByUrl };
