var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/User');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

//GITHUB
router.get(
  '/auth/github',
  passport.authenticate('github'));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/users/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

//GOOGLE
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/users/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

module.exports = router;
