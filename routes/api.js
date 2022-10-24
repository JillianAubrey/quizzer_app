
const express = require('express');
const router  = express.Router();
const { getQuizzes, addQuiz} = require('../db/queries/api');

router.get('/', (req, res) => {
  getQuizzes({public : true}).then(data => res.json(data));
});

router.post('/', (req, res) => {
  //user_id == req.session.user_id
  const user_id = 2;

  console.log(req.body);

  resContent = addQuiz(user_id, req.body);

  res.json(resContent)
})









module.exports = router;
