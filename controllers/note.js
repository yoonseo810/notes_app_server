const Note = require('../models/note.model');

// create a note
const addNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const {
      user: { user },
    } = req.user;

    if (!title || !content) {
      res.status(404);
      return next(new Error('Missing fields'));
    }

    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    res.status(200).json({
      success: true,
      note,
      message: 'Note added successfully',
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// get all notes
const getAllNotes = async (req, res, next) => {
  try {
    const {
      user: { user },
    } = req.user;

    const notes = await Note.find({ userId: user._id }).sort({
      isPinned: -1,
    });
    res.status(200).json({
      success: true,
      notes,
      message: 'All notes retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

// edit a note
const editNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const {
      user: { user },
    } = req.user;

    if (!title && !content && !tags) {
      res.status(404);
      return next(new Error('No changes made'));
    }

    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      res.status(404);
      return next(new Error('Note was not found'));
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      note,
      message: 'Note updated successfully',
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// delete a note
const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const {
      user: { user },
    } = req.user;

    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      res.status(404);
      return next(new Error('Note was not found'));
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// update notePinned
const updateNotePinned = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const {
      user: { user },
    } = req.user;

    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      res.status(404);
      return next(new Error('Note was not found'));
    }

    note.isPinned = isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      note,
      message: 'Note updated successfully',
    });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// search notes
const searchNotes = async (req, res, next) => {
  try {
    const {
      user: { user },
    } = req.user;
    const { query } = req.query;

    if (!query) {
      res.status(404);
      return next(new Error('Search query is required'));
    }

    const notesMatched = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { content: { $regex: new RegExp(query, 'i') } },
      ],
    });

    res.status(200).json({
      success: true,
      notes: notesMatched,
      message: 'All notes for search query retrieved successfully',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  addNote,
  getAllNotes,
  editNote,
  deleteNote,
  updateNotePinned,
  searchNotes,
};
