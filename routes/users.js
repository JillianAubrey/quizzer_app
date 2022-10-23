
const express = require('express');
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

router.get('/quiz_builder', (req, res) => {

  //user_id == req.session.user_id
  const user_id = 2;

  getUserById(user_id).then(user => {
    const templateVars = {userName: user.name};
    res.render('quiz_form', templateVars);
  });
});

module.exports = router;
