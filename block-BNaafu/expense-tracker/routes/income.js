var express = require('express');
var router = express.Router();
var Income = require('../model/Income');

//create expense form
router.get('/', (req, res, next) => {
  res.render('addIncome');
});

router.post('/', (req, res, next) => {
  var data = req.body;
  data.userId = req.user.id;
  data.buget = 'Income';
  Income.create(data, (err, createdIncome) => {
    if (err) return next(err);
    res.redirect('/dashboard');
  });
});

module.exports = router;
