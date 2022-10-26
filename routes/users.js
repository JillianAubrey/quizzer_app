const express = require('express');
const router  = express.Router();
const { getQuiz, getAttempt, getAttemptScore, getQuizResults, getQuizzes, getQuizAverage, getNumOfAttemptsQuiz } = require('../db/queries/api');
const { getUsers, getUserById } = require('../db/queries/users');

router.get('/', (req, res) => {
  const user_id = req.session.user_id;

  getUserById(user_id).then(user => {
    const templateVars = {userName: (!user ? '' : user.name)};
    res.render('index', templateVars);
  });
});

router.get('/quiz/:url',  (req, res) => {
  const user_id = req.session.user_id;

  Promise.all([
    getUserById(user_id),
    getQuiz({ url: req.params.url })
  ])
  .then(([user, quiz]) => {
      const templateVars = {
      userName: (!user ? '' : user.name),
      quiz
    };
    res.render('quiz', templateVars);
  });
})

router.get('/quiz/results/:url',  (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {};

  Promise.all([
    getUserById(user_id),
    getQuizResults({results_url: req.params.url})
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
  })
})

router.get('/attempt/:url',  (req, res) => {
  const user_id = req.session.user_id;
  const url = req.params.url;
  const templateVars = {};

  Promise.all([
    getUserById(user_id),
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
})

router.get('/quiz_builder', (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect('/quizapp/register');
  }

  getUserById(user_id).then(user => {
    const templateVars = {userName: (!user ? '' : user.name)};
    res.render('quiz_form', templateVars);
  });
});


router.get('/account', (req, res) => {
  const user_id = 1;
  let templateVars = {};

  Promise.all([
    getUserById(user_id),
    getQuizzes(user_id, {recent : true, showPrivate : true, ownQuizzes : true})
  ])
    .then(([user, quizzes]) => {
      templateVars.userName = (!user ? '' : user.name)
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
      console.log(result);
      templateVars.quizzes.forEach((quiz) => {
        // quiz.created_at = quiz.created_at.toDateString();
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
      console.log(templateVars);
    }).then(() => res.render('user', templateVars));
})

router.get('/login', (req, res) => {
  const user_id = req.session.user_id
  if (user_id) {
    return res.redirect('/');
  }
  const templateVars = {
    userName: '',
    user_id,
    errorMessage: '',
  }
  res.render('login', templateVars);
})

router.get('/register', (req, res) => {
  const user_id = req.session.user_id
  if (user_id) {
    return res.redirect('/');
  }
  const templateVars = {
    userName: '',
    user_id,
    errorMessage: '',
  }
  res.render('register', templateVars);
})


module.exports = router;
