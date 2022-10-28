const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users');
const { getAccountQuizzes, getAccountAttempts } = require('../db/queries/account_page');

// User account page
router.get('/', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect('/quizapp/login');
  }

  Promise.all([
    getAccountAttempts(userId),
    getAccountQuizzes(userId),
    getUserById(userId),
  ])
    .then(([attempts, quizzes, user]) => {
      const templateVars = {
        attempts,
        quizzes,
        userName: user.name
      };
      res.render('user', templateVars);
    });
});

module.exports = router;
