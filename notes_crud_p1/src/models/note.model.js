const mongoose = require("mongoose");

let notesScheme = new mongoose.Schema({
  // create obj to add validations
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    minlength: 10,
    required: true,
  },
});

// this is to create a model for the Scheme
// the mongoose.model accepts 2 parameters:- collection_name,scheme (i.e. notesScheme)
const NoteSchema = mongoose.model("notes", notesScheme);

module.exports = NoteSchema;
