const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const { getQuizzes } = require('../db/queries/get_quizzes');

// Separated Routes
const quizRoutes = require('./api_quiz');
const loginRoutes = require('./api_login');
const logoutRoute = require('./api_logout');

// Mount all resource routes
router.use('/quiz', quizRoutes);
router.use('/login', loginRoutes);
router.use('/logout', logoutRoute);

router.get('/', (req, res) => {
  const userId = req.session.userId;
  const query = req.query;
  getQuizzes(userId, undefined, query).then(data => {
    res.json(data);
  });
});

module.exports = router;
