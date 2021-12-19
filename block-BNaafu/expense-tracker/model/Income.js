var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incomeSchema = new Schema(
  {
    category: { type: String },
    amount: Number,
    date: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buget: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);
