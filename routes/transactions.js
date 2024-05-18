const express = require('express');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
} = require('../controllers/transaction');

const { authenticateToken } = require('../utils');

const router = express.Router();

router.get('/all', authenticateToken, getTransactions);

router.post('/add', authenticateToken, addTransaction);

router.delete('/delete/:id', authenticateToken, deleteTransaction);

module.exports = router;
