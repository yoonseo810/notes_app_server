const mongoose = require('mongoose');
const User = require('./models/user.model');
const Note = require('./models/note.model');
const bcrypt = require('bcryptjs');

let mongoDBConnectionString = process.env.MONGODB_URL;

module.exports.connect = () => {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(mongoDBConnectionString);

    db.on('error', (err) => {
      reject(err);
    });

    db.once('open', () => {
      resolve();
    });
  });
};

module.exports.createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const { fullName, email, password } = userData;
    if (!fullName) {
      reject('Full Name is required');
    }
    if (!email) {
      reject('Email is required');
    }
    if (!password) {
      reject('Password is required');
    }

    bcrypt.hash(password, 10).then((hash) => {
      const hashedPassword = hash;
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
      });

      // await newUser.save();

      newUser.save((err) => {
        if (err) {
          if (err.code == 11000) {
            reject('User email already taken');
          } else {
            reject('There was an error creating the user: ' + err);
          }
        } else {
          resolve(`User ${fullName} created successfully`);
        }
      });
    });
  }).catch((err) => reject(err));
};
