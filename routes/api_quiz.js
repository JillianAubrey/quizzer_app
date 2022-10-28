const express = require('express');
const router  = express.Router();

const { postAttempt } = require('../db/queries/post_attempt');
const { checkUserPermission, changePrivacy, deleteQuiz } = require('../db/queries/edit_quiz');
const { addQuiz} = require('../db/queries/post_quiz');

// Route for adding a new quiz to db
router.post('/', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res
      .status(401)
      .send('Must be logged in to create quiz');
  }
  const quiz = JSON.parse(Object.keys(req.body)[0]);

  addQuiz(quiz, userId)
    .then(urls => {
      res.json(urls);
    });
});

// Route for adding a new attempt to db
router.post('/attempt',  (req, res) => {
  const userId = req.session.userId;
  const submission = req.body;

  postAttempt(submission, userId)
    .then(url => {
      res.send(`/quizapp/attempt/${url}`);
    });
});

//Route for editing visibility (public vs private) of a quiz
router.post('/visibility/:id', (req, res) => {
  const userId = req.session.userId;
  const request = req.body.visibility;
  const quizId = req.params.id;

  checkUserPermission(userId, quizId)
  .then((permission) => {
    if (permission) {
      changePrivacy(quizId, request)
      .then(() => {
        res.send('privacy changed');
      });
    } else {
      res
        .status(401)
        .send('permission denied');
    }
  });
});

//Route for deleting a quiz
router.post('/delete/:id', (req, res) => {
  const userId = req.session.userId;
  const quizId = req.params.id;

  checkUserPermission(userId, quizId).then((permission) => {
    if (permission) {
      deleteQuiz(quizId).then(() => {
        res.send('quiz deleted');
      });
    } else {
      res
        .status(401)
        .send('permission denied');
    }
  });
});

module.exports = router;
