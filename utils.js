const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

const compareAsync = (param1, param2) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(param1, param2, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

module.exports = {
  authenticateToken,
  compareAsync,
};
