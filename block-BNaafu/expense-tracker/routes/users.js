var express = require('express');
var router = express.Router();
var User = require('../model/User');
const { locals } = require('../app');
const { PreconditionFailed } = require('http-errors');
// var nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const bcrypt = require('bcrypt');

function generateString() {
  let arr = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  let result = '';
  for (let i = 0; i <= 10; i++) {
    result += arr[Math.floor(Math.random() * arr.length)];
  }
  return result;
}
function otpGenerator() {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let otp = '';
  for (let i = 0; i <= 5; i++) {
    otp += arr[Math.floor(Math.random() * arr.length)];
  }
  return otp;
}
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users');
});

router.get('/signup', (req, res, next) => {
  res.render('signup', { error: req.flash('error')[0] });
});
router.post('/signup', (req, res, next) => {
  req.body.verifyToken = generateString();
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.code === 11000) {
        req.flash('error', 'This email is already registered...');
        return res.redirect('/users/signup');
      }
      return res.json({ err });
    }
    var mailOptions = {
      from: 'anujbph@gmail.com',
      to: user.email,
      subject: 'Account Verification Link',
      text:
        `Hello, thanks for registering on our site, Please select the link to verify your email\n` +
        `http://${req.headers.host}/users/verify-email?token=${user.verifyToken}&email=${user.email}`,
    };
    sgMail.send(mailOptions).then(
      () => {
        res.render('registration');
      },
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
  });
});
router.get('/verify-email', (req, res, next) => {
  let token = req.query.token;
  User.findOne({ email: req.query.email }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user.verifyToken === token) {
      User.findOneAndUpdate(
        { email: user.email },
        { isVerified: true },
        { new: true },
        (err, verifiedUser) => {
          if (err) {
            return next(err);
          }
          res.redirect('/users/login');
        }
      );
    }
  });
});

router.get('/login', (req, res) => {
  var error = req.flash('error')[0];
  res.render('login', { error });
});

router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email/Password required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    //no user
    if (!user) {
       req.flash('error', 'Email Does not exist...');
      return res.redirect('/users/login');
    }
    //compare password
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Wrong Password...');
        return res.redirect('/users/login');
      }
      //persisit logged in user info
      if (!user.isVerified) {
        req.flash('error', 'User is not verified...');
        return res.redirect('/users/signup');
      }
      req.session.userId = user.id;
      res.redirect('/');
    });
  });
});

// forget password

router.get('/resetPw', (req, res) => {
  var error = req.flash('error')[0];
  const { email } = req.query;
  const url = `/users/resetPw?email=${email}`;
  res.render('resetPw', { url,error });
});
router.post('/resetPw', (req, res, next) => {
  const { email } = req.query;
  const { password, password2 } = req.body;
  let bcryptedPassword = null;
  if (password === password2) {
    bcrypt.hash(password, 10, (err, hashed) => {
      if (err) return next(err);
      bcryptedPassword = hashed;
      User.findOneAndUpdate(
        { email },
        { $set: { password: bcryptedPassword } },
        { new: true },
        (err, user) => {
          if (err) {
            return res.send(err);
          }
          res.redirect('/users/login');
        }
      );
    });
  } else {
    req.flash('error', 'Password and confirm password does not macthed..');
    return res.redirect('/users/resetPw');
  }
});
router.get('/forgetPw/email', (req, res) => {
  res.render('forgetPw');
});
router.post('/forgetPw/email', (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email }, (err, user) => {
    if (!user) {
       req.flash('error', 'User is not registered..');
      return res.redirect('/users/login');
    }
    var otp = otpGenerator();
    var mailOptions = {
      from: 'anujbph@gmail.com',
      to: user.email,
      subject: 'Reset Password',
      text:
        `Hey ${user.firstname} ${user.lastname}, Please find OTP for resetting password is as below\n` +
        `OTP : ${otp}\n` +
        'Please click below link to verify your OTP\n' +
        `http://${req.headers.host}/users/forgetPw/verify-otp?otp=${otp}&email=${user.email}`,
    };
    sgMail.send(mailOptions).then(
      () => {
        res.render('otpSuccess');
      },
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
  });
});
router.get('/forgetPw/verify-otp', (req, res, next) => {
  const { email, otp } = req.query;
  const url = `/users/forgetPw/verify-otp?otp=${otp}&email=${email}`;
  res.render('otp', { url });
});
router.post('/forgetPw/verify-otp', (req, res, next) => {
  const { email, otp } = req.query;
  const input = req.body.otp;
  if (input === otp) {
    return res.redirect(`/users/resetPw?email=${email}`);
  } else {
    res.send(`<h1 style=text-align:center;color:red>Error:OTP is not correct</h1>`);
  }
});
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
