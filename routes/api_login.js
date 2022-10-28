const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');

const { getUserByEmail, addUser } = require('../db/queries/users');

// Log in route
router.post('/', (req, res) => {
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
      req.session.userId = user.id;
      res.redirect('/quizapp');
    });
});

// Registration route
router.post('/new', (req, res) => {
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
          req.session.userId = user.id;
          res.redirect('/quizapp');
        });
    });

});

module.exports = router;
