const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pokemonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  pokemonType: {
    type: [String],
    required: true,
  },
  abilities: {
    type: [String],
    required: true,
  },
  stats: {
    type: [Object],
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Pokemon', pokemonSchema);
