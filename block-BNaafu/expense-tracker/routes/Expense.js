var express = require('express');
var router = express.Router();
var Expense = require('../model/Expense');

//create expense form
router.get('/', (req, res, next) => {
  res.render('addExpense');
});

router.post('/', (req, res, next) => {
  var data = req.body;
  data.userId = req.user.id;
  data.buget = 'Expense';
  Expense.create(data, (err, createdExpense) => {
    if (err) return next(err);
    res.redirect('/dashboard');
  });
});

module.exports = router;
