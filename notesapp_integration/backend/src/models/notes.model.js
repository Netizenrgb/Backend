const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    minlength: [5, "Minimum of 5 characters are required"],
    required: true,
  },
});

const NotesModel = mongoose.model("notes", notesSchema);

module.exports = NotesModel;
