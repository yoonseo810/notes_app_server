require('dotenv').config();
const express = require('express');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');
const noteRoutes = require('./routes/notes');
const errorHandler = require('./middlewares/error');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.use('/api/notes', noteRoutes);

app.use('/', (req, res) => {
  return res.json({
    message: 'This is the REST API for notes app',
  });
});

app.use(errorHandler);

const startServer = () => {
  try {
    connectDB();

    app.listen(HTTP_PORT, () =>
      console.log(`Server listening on ${HTTP_PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
