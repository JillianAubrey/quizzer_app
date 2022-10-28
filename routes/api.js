const express = require('express');
const router  = express.Router();
const { getQuizzes } = require('../db/queries/get_quizzes');

// Separated Routes
const quizRoutes = require('./api_quiz');
const loginRoutes = require('./api_login');
const logoutRoute = require('./api_logout');

// Mount all resource routes
router.use('/quiz', quizRoutes);
router.use('/login', loginRoutes);
router.use('/logout', logoutRoute);

// Gets the quizzes for the home page
router.get('/', (req, res) => {
  const userId = req.session.userId;
  const query = req.query;
  getQuizzes(userId, query).then(data => {
    res.json(data);
  });
});

module.exports = router;
