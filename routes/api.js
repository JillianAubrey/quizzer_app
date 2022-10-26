
const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { getQuizzes, postAttempt, addQuiz } = require('../db/queries/api');
const { getUserById, getUserByEmail, addUser } = require('../db/queries/users');


router.get('/', (req, res) => {
  const user_id = 2;
  getQuizzes(user_id).then(data => {
    res.json(data);
});
});

router.post('/', (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;

  getUserById(user_id)
    .then((user) => addQuiz(user_id, req.body, user.name))
    .then((resContent) => res.json(resContent));

})

router.post('/quiz',  (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;
  const submission = req.body;

  postAttempt(submission, user_id)
  .then(url => {
    console.log(url);
    res.send(`/quizapp/attempt/${url}`);
  });
})

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      userName: '',
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('login', templateVars);
  }

 getUserByEmail(email)
 .then(user => {
   if (!user || !bcrypt.compareSync(password, user.password)) {
     const templateVars = {
       userName: '',
       errorMessage: 'That email and password combination did not match any accounts',
     };
     return res.status(400).render('login', templateVars);
   }
   req.session.user_id = user.id;
   res.redirect('/quizapp');
 });
});

router.post('/register', (req, res) => {
  const {name, email, password } = req.body;
  if (!name || !email || !password) {
    const templateVars = {
      userName: '',
      errorMessage: 'Please provide a name, email and password',
    };
    return res.status(400).render('register', templateVars);
  }

  getUserByEmail(email)
  .then(user => {
    if (user) {
      const templateVars = {
        userName: '',
        errorMessage: 'There is already an account for that email address',
      };
      return res.status(400).render('register', templateVars);
    }

    addUser(name, email, bcrypt.hashSync(password))
    .then(user => {
      console.log(user);
      req.session.user_id = user.id;
      res.redirect('/quizapp');
    });
  })

});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/quizapp');
});

module.exports = router;
