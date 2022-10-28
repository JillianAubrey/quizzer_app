const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users');
const { getQuizResults } = require('../db/queries/get_quiz_stats');
const { getQuiz } = require('../db/queries/get_quizzes');

// New quiz creation page
router.get('/new', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect('/quizapp/login');
  }

  getUserById(userId).then(user => {
    const templateVars = {userName: user.name};
    res.render('quiz_form', templateVars);
  });
});

// Page for aggregate results of single quiz
router.get('/results/:url',  (req, res) => {
  const userId = req.session.userId;
  const templateVars = {};
  const url = req.params.url;

  templateVars.url = url;

  Promise.all([
    getUserById(userId),
    getQuizResults(url)
  ])
    .then(([user, results]) => {
      templateVars.userName = (!user ? '' : user.name);
      templateVars.results = results;
      return results.quizId;
    })
    .then(quizId => getQuiz({id: quizId}))
    .then(quiz => {
      templateVars.quiz = quiz;
      res.render('quiz_stats', templateVars);
    });
});

// Page for taking a quiz
router.get('/:url',  (req, res) => {
  const userId = req.session.userId;

  Promise.all([
    getUserById(userId),
    getQuiz({ url: req.params.url })
  ])
    .then(([user, quiz]) => {
      const templateVars = {
        userName: (!user ? '' : user.name),
        quiz
      };
      res.render('quiz', templateVars);
    });
});

module.exports = router;
