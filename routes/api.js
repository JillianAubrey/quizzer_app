
const express = require('express');
const router  = express.Router();
const { getQuizzes, postAttempt, addQuiz } = require('../db/queries/api');

router.get('/', (req, res) => {
  getQuizzes({public : true}).then(data => res.json(data));
});

router.post('/', (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;

  console.log(req.body);

  resContent = addQuiz(user_id, req.body);

  console.log(resContent);

  res.json(resContent)
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
