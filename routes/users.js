
const express = require('express');
const { getQuiz, getAttempt, getAttemptScore, getQuizResults, getQuizzes, getQuizAverage, getNumOfAttemptsQuiz } = require('../db/queries/api');
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

  Promise.all([
    getUserById(user_id),
    getQuizResults({results_url: req.params.url})
  ])
  .then(([user, results]) => {
    templateVars.userName = user.name;
    templateVars.results = results;
    return results.quizId;
  })
  .then(quizId => getQuiz({id: quizId}))
  .then(quiz => {
    templateVars.quiz = quiz;
    res.render('quiz_stats', templateVars);
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
  const user_id = 1;
  let templateVars = {};

  Promise.all([
    getUserById(user_id),
    getQuizzes(user_id, {recent : true, showPrivate : true, ownQuizzes : true})
  ])
    .then(([user, quizzes]) => {
      templateVars.userName = user.name
      templateVars.quizzes = quizzes;
      return quizzes;
    })
    .then((quizzes) => {
      let promises = [];
      for (let quiz of quizzes) {
        promises.push(getQuizAverage(quiz.id));
        promises.push(getNumOfAttemptsQuiz(quiz.id))
      }
      return Promise.all(promises)
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
    }).then(() => res.render('user', templateVars));

})

module.exports = router;
