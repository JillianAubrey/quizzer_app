
const express = require('express');
const router  = express.Router();
const { getQuizzes, postAttempt } = require('../db/queries/api');

router.get('/', (req, res) => {
  getQuizzes({public : true}).then(data => res.json(data));
});

router.post('/', (req, res) => {
  console.log(req.body);
  res.send('hihi')
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

module.exports = router;
