const db = require('../connection');

const getQuizzes = function(userId,
                            options = {
                              recent : true,
                              untaken : false,
                              showPrivate : false,
                              ownQuizzes : false})
{
  let queryParams = [];

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

  if (options.untaken) {
    query += 'AND quizzes.id NOT IN (SELECT attempts.quiz_id FROM attempts WHERE user_id = $1) ';
    queryParams.push(userId);
  }

  if (!options.showPrivate) {
    query += ' AND NOT is_private';
  }

  if (options.ownQuizzes) {
    query += ` AND users.id = $1`;
    queryParams.push(userId);
  }

  query += ' GROUP BY quizzes.id, users.id';

  if (options.recent) {
    query += ' ORDER BY quizzes.created_at;';
  }

  return db.query(query, queryParams)
    .then(data => {
      return data.rows;
    })
    .catch(error => {
      console.log(error);
    });
};

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
  `;
  return db.query(query, [url || id])
    .then(data => {
      const {id, url, title, description, author} = data.rows[0];
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
          };
          question = questions[question_num];
        }
        question.answers.push({id: answer_id, text: answer});
      });
      return quiz;
    });
};

module.exports = { getQuiz, getQuizzes };
