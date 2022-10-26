const express = require('express');
const router  = express.Router();
const { getQuizzes, postAttempt, addQuiz, checkUserPermission, changePrivacy, deleteQuiz } = require('../db/queries/api');
const { getUserById, getUserByEmail, addUser } = require('../db/queries/users');


router.get('/', (req, res) => {
  const user_id = 2;
  getQuizzes(user_id).then(data => {
    res.json(data);
});
});

router.post('/', (req, res) => {
  const user_id = req.session.user_id;

  getUserById(user_id)
    .then((user) => addQuiz(user_id, req.body, user.name))
    .then((resContent) => res.json(resContent));

})

router.post('/quiz',  (req, res) => {
  const user_id = req.session.user_id;
  const submission = req.body;

  postAttempt(submission, user_id)
  .then(url => {
    console.log(url);
    res.send(`/quizapp/attempt/${url}`);
  });
})

router.post('/visibility/:id', (req, res) => {
  const user_id = req.session.user_id;
  const request = req.body.visibility;
  const quizUrl = req.params.id;

  checkUserPermission(user_id, quizUrl).then((permission) => {
    if (permission) {
      changePrivacy(quizUrl, request).then(() => {
        res.send('privacy changed');
      })
    } else {
      res
        .status(401)
        .send('permission denied')
    }
  })
})

router.post('/quiz/:id', (req, res) => {
  const user_id = req.session.user_id;
  const quizUrl = req.params.id;

  checkUserPermission(user_id, quizUrl).then((permission) => {
    if (permission) {
      deleteQuiz(quizUrl).then(() => {
        res.send('quiz deleted');
      })
    } else {
      res
        .status(401)
        .send('permission denied')
    }
  })
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = {
      userName: '',
      errorMessage: 'Please provide an email and password',
    };
    return res.status(400).render('login', templateVars);
  }

 getUserByEmail(email)
 .then(user => {
   if (!user || !bcrypt.compareSync(password, user.password)) {
     const templateVars = {
       userName: '',
       errorMessage: 'That email and password combination did not match any accounts',
     };
     return res.status(400).render('login', templateVars);
   }
   req.session.user_id = user.id;
   res.redirect('/quizapp');
 });
});

router.post('/register', (req, res) => {
  const {name, email, password } = req.body;
  if (!name || !email || !password) {
    const templateVars = {
      userName: '',
      errorMessage: 'Please provide a name, email and password',
    };
    return res.status(400).render('register', templateVars);
  }

  getUserByEmail(email)
  .then(user => {
    if (user) {
      const templateVars = {
        userName: '',
        errorMessage: 'There is already an account for that email address',
      };
      return res.status(400).render('register', templateVars);
    }

    addUser(name, email, bcrypt.hashSync(password))
    .then(user => {
      console.log(user);
      req.session.user_id = user.id;
      res.redirect('/quizapp');
    });
  })

});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/quizapp');
});

module.exports = router;
