
const express = require('express');
const { getQuiz, getAttempt, getAttemptScore, getQuizResults } = require('../db/queries/api');
const router  = express.Router();
const { getUsers, getUserById } = require('../db/queries/users');

router.get('/', (req, res) => {

  //user_id == req.session.user_id
  const user_id = 2;

  getUserById(user_id).then(user => {
    const templateVars = {userName: user.name};
    res.render('index', templateVars);
  });
});

router.get('/quiz/:url',  (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;

  Promise.all([
    getUserById(user_id),
    getQuiz({ url: req.params.url })
  ])
  .then(([user, quiz]) => {
      const templateVars = {
      userName: user.name,
      quiz
    };
    res.render('quiz', templateVars);
  });
})

router.get('/quiz/results/:url',  (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;
  const templateVars = {};

  getQuizResults({results_url: req.params.url})
  .then(results => {
    templateVars.results = results;
    return results.quizId;
  })
  .then(quizId => {
    getQuiz({id: quizId})
  })
  .then(quiz => {
    templateVars.quiz = quiz;
    res.render('results', templateVars);
  })
})

router.get('/attempt/:url',  (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;
  const url = req.params.url;
  const templateVars = {};

  Promise.all([
    getUserById(user_id),
    getAttempt({ url }),
    getAttemptScore({ url })
  ])
  .then(([user, attempt, score]) => {
    templateVars.userName = user.name;
    templateVars.attempt = attempt;
    templateVars.score = score;
    return getQuiz({id: attempt.quiz_id});
  })
  .then(quiz => {
    templateVars.quiz = quiz;
    res.render('quiz_attempt', templateVars);
  });
})

router.get('/quiz_builder', (req, res) => {

  //user_id == req.session.user_id
  const user_id = 2;

  getUserById(user_id).then(user => {
    const templateVars = {userName: user.name};
    res.render('quiz_form', templateVars);
  });
});


router.get('/account', (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;

  getUserById(user_id)
    .then(user => {
    const templateVars = {userName: user.name};
    res.render('user', templateVars);
  });


})

module.exports = router;
