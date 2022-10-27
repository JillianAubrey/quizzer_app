const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users')
const { getQuizAverage, getNumOfAttemptsQuiz } = require('../db/queries/get_quiz_stats')
const { getQuizzes } = require('../db/queries/get_quizzes')
const { getAllUserAttempts, getAttemptScore } = require('../db/queries/get_attempts')

router.get('/', (req, res) => {
  const user_id = req.session.user_id

  if (!user_id) {
    return res.redirect('/quizapp/register');
  }

  let templateVars = {};
  Promise.all([
    getUserById(userId),
    getQuizzes(userId, {recent : true, showPrivate : true, ownQuizzes : true})
  ])
    .then(([user, quizzes]) => {
      templateVars.userName = (!user ? '' : user.name);
      templateVars.quizzes = quizzes;
      return quizzes;
    })
    .then((quizzes) => {
      let promises = [];
      for (let quiz of quizzes) {
        promises.push(getQuizAverage(quiz.id));
        promises.push(getNumOfAttemptsQuiz(quiz.id));
      }
      return Promise.all(promises);
    })
    .then(result => {
      templateVars.quizzes.forEach((quiz) => {
        quiz.created_at = quiz.created_at.toISOString();
        for (let res of result) {
          if (quiz.id === res[0]) {
            if (res[1].average) {
              quiz.average = Math.round(res[1].average * 10) / 10;
            }
            if (res[1].attempts) {
              quiz.attempts = res[1].attempts;
            }
          }
        }
      })
    }).then(() => getAllUserAttempts(user_id))
      .then((attempts) => {
        templateVars.attempts = attempts;
        let promises = [];
        for (let attempt of attempts) {
          let url = attempt.attempturl;
          promises.push(getAttemptScore({ url }))
        }
        return Promise.all(promises);
      })
      .then((scores) => {
        let count = 0;
        for (let attempt of templateVars.attempts) {
          attempt.attempted_at = attempt.attempted_at.toISOString();
          attempt.score = scores[count].correct;
          count++
        }
      }).then(() => {
        console.log(templateVars);
        res.render('user', templateVars)
      })
});

module.exports = router;
