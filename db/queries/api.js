//file for API queries (may share some functionality with db/users.js but trying to modularize).

const db = require('../connection'); //connect to DB
const { generateRandomString } = require('./helpers');

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
    return quiz;
  })
};

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
}

const addQuestions = function(quizId, content) {
  let queryParams = [];
  let queryCount = 1;

  let questionQuery = `
    INSERT INTO questions(quiz_id, text, sequence) VALUES `

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
}

const addAnswers = function(questions, content) {

  let ansQuery = `INSERT INTO answers(question_id, text, is_correct) VALUES `
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

          ansQuery += `($${queryCount}, $${queryCount + 1}, $${queryCount + 2}),`
          queryParams.push(question.id, content[key]);

          if (answers.includes(key)) {
            queryParams.push('TRUE')
          } else {
            queryParams.push('FALSE')
          }

          queryCount += 3;

        }
      }
    }
  })

  ansQuery = ansQuery.slice(0, -1);
  ansQuery += 'RETURNING*;';

  return db.query(ansQuery, queryParams);

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
    WHERE ${url ? 'attempts.url' : 'attempts.id'} = $1;
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

const postAttempt = function(submission, user_id) {
  const url = Math.round(Math.random() * 1e10); //replace later with random string generation
  const queryAttempt = `
    INSERT INTO attempts (quiz_id, user_id, url)
    VALUES ($1, $2, $3)
    RETURNING id;
  `
  const attemptParams = [submission.quiz_id, user_id, url];

  let queryAnswers = 'INSERT INTO attempt_answers (attempt_id, answer_id) VALUES';
  const queryAnswersParams = [null]; //null will be replaced with attempt_id

  submission.answerIds.forEach( id => {
    queryAnswersParams.push(id)
    queryAnswers += `
      ($1, $${queryAnswersParams.length}),`
  });

  queryAnswers = queryAnswers.slice(0,-1) + ';';

  return db.query(queryAttempt, attemptParams)
  .then(data => {
    queryAnswersParams[0] = data.rows[0].id;
    return db.query(queryAnswers, queryAnswersParams);
  })
  .then(() => {
    return url;
  })
}

const getQuizResults = function({results_url, id}) {
  const queryQuizId = `
    SELECT id
    FROM quizzes
    WHERE ${results_url ? 'results_url' : 'id'} = $1
  `

  const queryCounts = `
  SELECT COUNT(DISTINCT attempts.user_id) AS attempters,
    COUNT(DISTINCT attempts.id) AS attempts,
    COUNT (DISTINCT questions.id) AS questions
  FROM attempts
  JOIN quizzes ON
    quizzes.id = attempts.quiz_id
  JOIN questions ON
    quizzes.id = questions.quiz_id
  WHERE quizzes.id = $1
  `

  const queryAverageScore =`
  SELECT AVG(score) AS average
  FROM (
    SELECT COUNT(*) AS score
    FROM attempts
    JOIN attempt_answers
      ON attempts.id = attempt_id
    JOIN answers
      ON answers.id = answer_id
    WHERE is_correct
      AND attempts.quiz_id = $1
    GROUP BY attempts.user_id
  ) AS scores
  `

  const queryByAttempt = `
  SELECT users.name, attempts.url,
    COUNT(*) filter (where "is_correct") AS score
  FROM attempts
  LEFT JOIN attempt_answers
    ON attempts.id = attempt_id
  JOIN answers
    ON answers.id = answer_id
  LEFT JOIN users
    ON attempts.user_id = users.id
  WHERE attempts.quiz_id = $1
  GROUP BY users.id, attempts.id
  `

  const queryByAnswer =`
  SELECT answers.id, is_correct,
    COUNT(attempt_answers.*) AS count
  FROM answers
  JOIN questions
    ON questions.id = question_id
  JOIN quizzes
    ON quizzes.id = questions.quiz_id
  LEFT JOIN attempt_answers
    ON answers.id = answer_id
  LEFT JOIN attempts
    ON attempts.id = attempt_id
  WHERE quizzes.id = $1
  GROUP BY answers.id
  `

  return db.query(queryQuizId, [results_url || id])
  .then(data => data.rows[0].id)
  .then(quiz_id => {
    return Promise.all([
      quiz_id,
      db.query(queryCounts, [quiz_id])
        .then(data => data.rows[0]),
      db.query(queryAverageScore, [quiz_id])
        .then(data => Number(data.rows[0].average)),
      db.query(queryByAttempt, [quiz_id])
        .then(data => data.rows),
      db.query(queryByAnswer, [quiz_id])
        .then(data => {
          return data.rows.reduce((byAnswer, row) => {
            byAnswer[row.id] = row
            return byAnswer
          }, {})}
        ),
    ])
  })
  .then(([quiz_id, {attempters, attempts, questions}, average, byAttempt, byAnswer]) => {
    return {
      quiz_id,
      attempters,
      attempts,
      questions,
      average,
      byAttempt,
      byAnswer,
    }
  });
}

module.exports = { getQuizzes, getQuiz, getAttempt, getAttemptScore, postAttempt, addQuiz, getQuizResults };
