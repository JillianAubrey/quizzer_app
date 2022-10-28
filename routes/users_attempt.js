const express = require('express');
const router  = express.Router();

const { getUserById } = require('../db/queries/users');
const { getAttempt } = require('../db/queries/get_attempts');

// Single attempt page
router.get('/:url',  (req, res) => {
  const userId = req.session.userId;
  const url = req.params.url;

  Promise.all([
    getUserById(userId),
    getAttempt({ url }),
  ])
    .then(([user, attempt]) => {
      const templateVars = {
        attempt,
        userName: (!user ? '' : user.name)
      };
      res.render('quiz_attempt', templateVars);
    })
    .catch(error => console.log(error));
});

module.exports = router;
