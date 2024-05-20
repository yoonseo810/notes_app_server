const express = require('express');
const {
  getFavouritePokemon,
  addPokemon,
  removePokemon,
} = require('../controllers/pokemon');
const { authenticateToken } = require('../utils');

const router = express.Router();

router.get('/all', authenticateToken, getFavouritePokemon);

router.post('/add', authenticateToken, addPokemon);

router.delete('/delete/:id', authenticateToken, removePokemon);

module.exports = router;
