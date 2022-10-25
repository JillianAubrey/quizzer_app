
const express = require('express');
const router  = express.Router();
const { getQuizzes, postAttempt, addQuiz } = require('../db/queries/api');
const { getUserById } = require('../db/queries/users');


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








module.exports = router;
