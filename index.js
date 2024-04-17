const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
dotenv.config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { authenticateToken, compareAsync } = require('./utils');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Note = require('./models/note.model');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// mongoose.connect(process.env.MONGODB_URL);
app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.json({ data: 'hello' });
});

// Create account
app.post('/create', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: 'Full Name is required' });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: 'Email is required' });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: 'Password is required' });
  }
  try {
    const isUser = await User.findOne({ email });

    if (isUser) {
      return res.json({
        error: true,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '36000m',
    });

    return res.json({
      error: false,
      fullName,
      email,
      accessToken,
      message: 'Registration complete',
    });
  } catch (error) {
    res.status(400).json({ error: true, message: 'Internal Server error' });
  }
});

// app.post('/create', (req, res) => {
//   service
//     .createUser(req.body)
//     .then((msg) => {
//       res.json({ message: msg });
//     })
//     .catch((msg) => {
//       res.status(422).json({ message: msg });
//     });
// });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const userInfo = await User.findOne({ email });

  if (!userInfo) {
    return res.status(400).json({ message: 'User not found' });
  }

  const compared = await compareAsync(password, userInfo.password);

  if (compared === true) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '36000m',
    });

    return res.json({
      error: false,
      message: 'Login Successful',
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: 'Invalid Credentials',
    });
  }
});

app.get('/getUser', authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: '',
  });
});

app.post('/addNote', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: 'Title is required' });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: 'Content is required' });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: 'Note added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.put('/editNote/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: 'No changes provided' });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: 'Note updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.get('/getAllNotes', authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({
      isPinned: -1,
    });
    return res.json({
      error: false,
      notes,
      message: 'All notes retrieved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.delete('/deleteNote/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: 'Note not found',
      });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.put('/updateNotePinned/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;

  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }
    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: 'Note updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

// app.listen(HTTP_PORT);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log('API listening on: ', HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log('unable to start the server');
    process.exit();
  });

// module.exports = app;

// service
//   .connect()
//   .then(() => {
//     app.listen(HTTP_PORT, () => {
//       console.log(`API listening on: ${HTTP_PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(`unable to start the server: ${err}`);
//     process.exit();
//   });
