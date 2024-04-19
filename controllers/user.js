const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { compareAsync } = require('../utils');

// fetch all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// create a new user
const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400);
      return next(new Error('Missing fields'));
    }
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(404);
      return next(new Error('User already exists'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '36000m',
    });

    res.status(200).json({
      success: true,
      fullName,
      email,
      accessToken,
      message: 'Registration complete',
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// user login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Missing fields'));
    }
    const userExists = await User.findOne({ email });
    if (!userExists) {
      res.status(404);
      return next(new Error('User does not exist'));
    }

    const compared = await compareAsync(password, userExists.password);

    if (compared) {
      const user = { user: userExists };
      const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '36000m',
      });
      res.status(200).json({
        success: true,
        message: 'Login Successful',
        email,
        accessToken,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// get one user
const getUser = async (req, res, next) => {
  try {
    const {
      user: { user },
    } = req.user;
    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      res.status(404);
      return next(new Error('User does not exist'));
    }
    res.status(200).json({
      success: true,
      user: {
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const changeUserPassword = async (req, res, next) => {
  try {
    const { password, _id } = req.body;

    if (!password) {
      res.status(404);
      return next(new Error('Password is missing'));
    }
    const user = await User.findOne({ _id });

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, _id } = req.body;

    if (!fullName || !email) {
      res.status(404);
      return next(new Error('Missing name or email'));
    }

    const user = await User.findOne({ _id });

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  login,
  getUser,
  updateUser,
  changeUserPassword,
};
