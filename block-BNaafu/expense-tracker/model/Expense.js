var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseSchema = new Schema(
  {
    category: { type: String, require: true },
    amount: { type: Number },
    date: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    buget: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
