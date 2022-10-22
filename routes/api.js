
const express = require('express');
const router  = express.Router();
const getQuizzes = require('../db/queries/api');

router.get('/', (req, res) => {
  getQuizzes({public : true}).then(data => res.json(data));
});

module.exports = router;
