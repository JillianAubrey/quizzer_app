
const express = require('express');
const { getQuizByUrl } = require('../db/queries/api');
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
    getQuizByUrl(req.params.url)
  ])
  .then(([user, quiz]) => {
      const templateVars = {
      userName: user.name,
      quiz
    };
    res.render('quiz', templateVars);
  });
})

module.exports = router;
