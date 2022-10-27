const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users')
const { getQuiz } = require('../db/queries/get_quizzes')
const { getAttempt, getAttemptScore } = require('../db/queries/get_attempts')

router.get('/:url',  (req, res) => {
  const userId = req.session.userId;
  const url = req.params.url;
  const templateVars = {};

  Promise.all([
    getUserById(userId),
    getAttempt({ url }),
    getAttemptScore({ url })
  ])
    .then(([user, attempt, score]) => {
      templateVars.userName = (!user ? '' : user.name);
      templateVars.attempt = attempt;
      templateVars.score = score;
      return getQuiz({id: attempt.quiz_id});
    })
    .then(quiz => {
      templateVars.quiz = quiz;
      res.render('quiz_attempt', templateVars);
    });
});

module.exports = router;
