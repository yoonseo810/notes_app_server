const express = require('express');
const {
  createUser,
  getAllUsers,
  login,
  getUser,
  updateUser,
  changeUserPassword,
} = require('../controllers/user');
const { authenticateToken } = require('../utils');

const router = express.Router();

router.post('/create', createUser);

router.get('/all', getAllUsers);

router.post('/login', login);

router.get('/getUser', authenticateToken, getUser);

router.put('/update', authenticateToken, updateUser);

router.put('/changePassword', authenticateToken, changeUserPassword);

module.exports = router;
