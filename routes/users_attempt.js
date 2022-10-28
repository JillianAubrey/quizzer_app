const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users')
const { getQuiz } = require('../db/queries/get_quizzes')
const { getAttempt, getAttemptScore } = require('../db/queries/get_attempts')

router.get('/:url',  (req, res) => {
  const userId = req.session.userId;
  const url = req.params.url;

  Promise.all([
    getUserById(userId),
    getAttempt({ url }),
  ])
  .then(([user, attempt, score]) => {
    const templateVars = {
      attempt,
      userName: (!user ? '' : user.name)
    }
    res.render('quiz_attempt', templateVars);
  })
  .catch(error => console.log(error));
});

module.exports = router;
