const express = require("express");
const dbconnection = require("./config/db");
const NoteSchema = require("./models/note.model");
const app = express();

app.use(express.json());

dbconnection();

app.get("/", (req, res) => {
  res.send("yooooho");
});


app.post("/create", async (req, res) => {
  // Extract the title and description fields from the request body.
  // The frontend must send these values in the request body.
  const { title, description } = req.body;

  // Create and save a new note in MongoDB.
  // NoteSchema.create() is asynchronous and returns a Promise,
  // so we use "await" to wait until the database operation finishes.
  const newNote = await NoteSchema.create({
    title: title,
    description: description,
  });

  res.send({
    success: true,
    message: "Note created successfully",
    data: newNote,
  });
});



module.exports = app;
