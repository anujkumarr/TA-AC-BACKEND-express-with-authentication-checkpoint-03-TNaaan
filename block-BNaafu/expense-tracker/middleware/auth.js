var User = require('../model/User');

module.exports = {
  loggedInUser: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.redirect('/users/login');
    }
  },
  userInfo: (req, res, next) => {
    var userId =
      (req.session && req.session.userId) ||
      (req.session && req.session.passport && req.session.passport.user);
    if (userId) {
      User.findById(userId,(err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.user = user;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
};
