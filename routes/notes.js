const express = require('express');
const {
  addNote,
  getAllNotes,
  editNote,
  deleteNote,
  updateNotePinned,
  searchNotes,
} = require('../controllers/note');

const { authenticateToken } = require('../utils');

const router = express.Router();

router.post('/add', authenticateToken, addNote);

router.get('/all', authenticateToken, getAllNotes);

router.put('/edit/:noteId', authenticateToken, editNote);

router.delete('/delete/:noteId', authenticateToken, deleteNote);

router.put('/updatePinned/:noteId', authenticateToken, updateNotePinned);

router.get('/searchNotes', authenticateToken, searchNotes);

module.exports = router;
