const db = require('../connection');

/**
 * Get quiz with specific attempt info from db
 * @param {String} url Attempt url
 * @param {String} id  Attempt id
 * @return {Promise}   Promise resolves to attempt object, which includes entire quiz with info on spcefic attempt.
 * */
const getAttempt = function({url, id}) {
  const query = `
  SELECT attempts.url,
    quizzes.url AS quiz_url, quizzes.title, quizzes.description,
    users.name AS attempter,
    authors.name AS author,
    questions.text AS question,
    questions.sequence AS question_num,
    answers.text AS answer,
    answers.id AS answer_id,
    answers.is_correct,
    (attempt_answers.id > 0) AS answered
  FROM attempts
  LEFT JOIN users
    ON users.id = attempts.user_id
  JOIN quizzes
    ON quizzes.id = attempts.quiz_id
  JOIN users authors
    ON authors.id = quizzes.user_id
  JOIN questions
    ON quizzes.id = questions.quiz_id
  JOIN answers
    ON questions.id = question_id
  LEFT JOIN attempt_answers
    ON answers.id = attempt_answers.answer_id
    AND attempts.id = attempt_answers.attempt_id
  WHERE ${url ? 'attempts.url' : 'attempts.id'} = $1
  ORDER BY question_num, answer_id;
`;

  return db.query(query, [url || id])
    .then(data => {
      const {url, quiz_url, title, description, attempter, author} = data.rows[0];
      const attempt = {
        url,
        quiz_url,
        title,
        description,
        attempter,
        author,
        score: 0,
        total: 0,
        questions:{}
      };

      const questions = attempt.questions;
      let question;

      data.rows.forEach(row => {
        const { question_num, answer_id, answer, answered, is_correct } = row;
        if (!questions[question_num]) {
          attempt.total++;
          questions[question_num] = {
            num: question_num,
            text: row.question,
            answers: []
          };
          question = questions[question_num];
        }
        question.answers.push({id: answer_id, text: answer, answered, isCorrect: is_correct});
        if (answered && is_correct) {
          attempt.score++;
        }
      });
      return attempt;
    })
    .catch(error => console.log(error));;
};

module.exports = { getAttempt };
