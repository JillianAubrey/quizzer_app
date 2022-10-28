const db = require('../connection');

const getQuizzes = function(userId,
                            options = {
                              recent : true,
                              untaken : false,
                              showPrivate : false,
                              ownQuizzes : false,
                              popular: false},
                            request)
{

  if (Object.keys(request).length) {

    switch(request.request) {
      case 'popular':
        options.popular = true;
        break;
      case 'recent':
        options.recent = true;
        break;
      case 'oldest':
        options.recent = false;
        break;
      case 'untaken':
        options.untaken = true;
        break;
    }
  }

  let queryParams = [];
  let query = `
  SELECT
    quizzes.*,
    COUNT(DISTINCT questions.*) AS question_count,
    users.name AS author,
    COUNT (DISTINCT attempts) AS attempts_count
  FROM quizzes
  LEFT JOIN questions
    ON quizzes.id = quiz_id
  LEFT JOIN users
    ON users.id = user_id
  LEFT JOIN attempts
    ON attempts.quiz_id = quizzes.id
    WHERE TRUE
  `; // WHERE TRUE initiates the WHERE so the filter options can be added with AND

  if (options.untaken) {
    query += 'AND quizzes.id NOT IN (SELECT DISTINCT attempts.quiz_id FROM attempts WHERE user_id = $1)';
    queryParams.push(userId);
  }

  if (!options.showPrivate) {
    query += ' AND NOT is_private ';
  }

  if (options.ownQuizzes) {
    query += ` AND users.id = $1 `;
    queryParams.push(userId);
  }

  query += ' GROUP BY attempts.quiz_id, quizzes.id, users.id ';

  if (!options.popular) {
    query += ' ORDER BY quizzes.created_at ';
  }

  if (!options.recent && !options.popular) {
    query += `DESC `
  }

  if (options.popular) {
    query += ' ORDER BY attempts_count '
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
