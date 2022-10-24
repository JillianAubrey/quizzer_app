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
    SELECT quizzes.id, url, title, description,
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
    const {id, url, title, description, author} = data.rows[0]
    const quiz = {
      id,
      url,
      title,
      description,
      author,
      questions: {}
    };

    const questions = quiz.questions;
    let question;
    data.rows.forEach(row => {
      const { question_num, answer_id, answer } = row;
      if (!questions[question_num]) {
        questions[question_num] = {
          num: question_num,
          text: row.question,
          answers: []
        }
        question = questions[question_num];
      }
      question.answers.push({id: answer_id, text: answer});
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
    const {quiz_id, user_id, attempter} = data.rows[0];
    const attempt = {
      quiz_id,
      user_id,
      attempter,
      answers:{}
    }
    const answers = attempt.answers;
    data.rows.forEach(row => {
      const { answer_id, is_correct} = row
      const answer = {
        id: answer_id,
        is_correct
      }
      answers[answer_id] = answer
    })
    return attempt;
  })
}

const getAttemptScore = function({url, id}) {
  queryCorrect = `
    SELECT COUNT(*) filter (where "is_correct") AS correct
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE ${url ? 'url' : 'attempts.id'} = $1;
  `
  queryTotal = `
    SELECT COUNT(questions.*) AS total
    FROM attempts
    JOIN quizzes
      ON quizzes.id = attempts.quiz_id
    JOIN questions
      ON quizzes.id = questions.quiz_id
    WHERE ${url ? 'url' : 'attempts.id'} = $1;
  `

  return Promise.all([
    db.query(queryCorrect, [url || id]),
    db.query(queryTotal, [url || id]),
  ])
  .then(([correct, total]) => {
    const score = {
      correct: correct.rows[0].correct,
      total: total.rows[0].total
    }
    return score;
  })
};

module.exports = { getQuizzes, getQuiz, getAttempt, getAttemptScore };
