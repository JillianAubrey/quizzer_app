// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));
app.use(cookieSession({
  keys: [
    'lk0XZ4Bdelb1tb44R5g0tmN1BCedJfjnChqGcqlD',
    'RzQDTBORGRpGOtK5y9mPzVtC4ACN1zGupPdChImE',
    'KjgvMzBPij1DC0zA8FiRYA1mmF23b7zR7yetZolS',
    'oOx1XZeGztQLaBWvZkGvucZlAzGn0CE9UildgknM',
    'kAmmDcHFOeHKbaNEx7szNF8wfIButWDoT2QpcPRw',
    'JkH0RKsrU9pVRfG079pcASkokW80sDbAgU7zC3hW',
    'zcKZ4otbNu0IWzZoWGUmppSmypgnxzlMuFGzW6As',
    'FVHER4AxdGwI5HyDgfqhHw2Jpnuv9jg10RcufEJQ',
    'gpbaPkpKV13Crq3lygfj4unulGKd3Jo7omPYBw1x',
    'kRASoBIqhlZXsKFRIqVJedMeyv6DlDDvNZXLcyxF',
  ]
}));

// Separated Routes for each Resource
const userRoutes = require('./routes/users');
const apiRoutes = require('./routes/api');


// Mount all resource routes
app.use('/api', apiRoutes);
app.use('/quizapp', userRoutes);

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

app.get('/', (req, res) => {
  res
    .status(302)
    .redirect('/quizapp')
});

app.listen(PORT, () => {
  console.log(`Quizzer App listening on port ${PORT}`);
});
