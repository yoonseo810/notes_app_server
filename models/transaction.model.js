const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  category: {
    type: String,
    required: [true, 'Please choose a category'],
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
  },
  amount: {
    type: Number,
    required: [true, 'Please enter valid amount'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
