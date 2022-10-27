const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users')
// const { getQuizAverage, getNumOfAttemptsQuiz } = require('../db/queries/get_quiz_stats')
// const { getQuizzes } = require('../db/queries/get_quizzes')
// const { getAllUserAttempts, getAttemptScore } = require('../db/queries/get_attempts')
const { getAccountQuizzes, getAccountAttempts } = require('../db/queries/account_page')

router.get('/', (req, res) => {
  const userId = req.session.userId

  if (!userId) {
    return res.redirect('/quizapp/login');
  }

  Promise.all([
    getAccountAttempts(userId),
    getAccountQuizzes(userId),
    getUserById(userId),
  ])
  .then(([attempts, quizzes, user]) => {
    templateVars = {
      attempts,
      quizzes,
      userName: user.name
    }
    res.render('user', templateVars)
  });
});

module.exports = router;
