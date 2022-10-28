const express = require('express');
const router  = express.Router();

// Logout route
router.post('/', (req, res) => {
  req.session = null;
  res.redirect('/quizapp');
});

module.exports = router;
