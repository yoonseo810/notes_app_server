const Transaction = require('../models/transaction.model');

// get all transactions
const getTransactions = async (req, res, next) => {
  try {
    const {
      user: { user },
    } = req.user;
    const transactions = await Transaction.find({
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

// add a transaction
const addTransaction = async (req, res, next) => {
  try {
    const { category, expenseType, description, amount } = req.body;
    const {
      user: { user },
    } = req.user;
    const transaction = await Transaction.create({
      category,
      expenseType,
      description,
      amount,
      userId: user._id,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error',
      });
    }
  }
};

// delete a transaction

const deleteTransaction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      user: { user },
    } = req.user;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: user._id,
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'No transaction found',
      });
    }
    await Transaction.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: 'Transaction deleted',
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  deleteTransaction,
};
