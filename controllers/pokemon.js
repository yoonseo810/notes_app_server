const Pokemon = require('../models/pokemon.model');

const getFavouritePokemon = async (req, res, next) => {
  try {
    const {
      user: { user },
    } = req.user;
    const pokemons = await Pokemon.find({
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      count: pokemons.length,
      data: pokemons,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

const addPokemon = async (req, res, next) => {
  try {
    const { name, weight, pokemonType, abilities, stats, imgUrl } = req.body;
    const {
      user: { user },
    } = req.user;
    const pokemon = await Pokemon.create({
      name,
      weight,
      pokemonType,
      abilities,
      stats,
      imgUrl,
      userId: user._id,
    });

    return res.status(201).json({
      success: true,
      data: pokemon,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

const removePokemon = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      user: { user },
    } = req.user;

    const pokemon = await Pokemon.findOne({
      _id: id,
      userId: user._id,
    });
    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: 'No Pokemon found',
      });
    }
    await Pokemon.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: 'Pokemon removed',
      data: {},
      id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};

module.exports = {
  getFavouritePokemon,
  addPokemon,
  removePokemon,
};
