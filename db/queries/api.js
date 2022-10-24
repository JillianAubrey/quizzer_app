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

const getQuiz = function({url, id}) {
  const query = `
    SELECT quizzes.id, title, description,
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
    WHERE ${url ? 'url' : 'quizzes.id'} = $1
    ORDER BY question_num;
  `
  return db.query(query, [url || id])
  .then(data => {
    const quiz = {
      id: data.rows[0].id,
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

const getAttempt = function({url, id}) {
  const query =`
    SELECT quiz_id, user_id,
      users.name AS attempter,
      attempt_answers.answer_id,
      is_correct
    FROM attempts
    LEFT JOIN users
      ON users.id = user_id
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE ${url ? 'url' : 'attempts.id'} = $1;
  `
  return db.query(query, [url || id])
  .then(data => {
    console.log(data.rows)
    return data.rows;
  })
}


module.exports = { getQuizzes, getQuiz, getAttempt };
