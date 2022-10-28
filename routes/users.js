const express = require('express');
const router  = express.Router();
const { getUserById } = require('../db/queries/users');

// Separated Routes
const quizRoutes = require('./users_quiz');
const accountRoute = require('./users_account');
const attemptRoute = require('./users_attempt');
const loginRoutes = require('./users_login');

// Mount all resource routes
router.use('/quiz', quizRoutes);
router.use('/account', accountRoute);
router.use('/attempt', attemptRoute);
router.use('/login', loginRoutes);

//Home page
router.get('/', (req, res) => {
  const userId = req.session.userId;

  getUserById(userId).then(user => {
    const templateVars = {userName: (!user ? '' : user.name)};
    res.render('index', templateVars);
  });
});

module.exports = router;
