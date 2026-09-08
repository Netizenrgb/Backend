const express = require("express");
const NotesModel = require("./models/notes.model");
const dbconnection = require("./config/db");
const createnotescontroller = require("./controllers/createnotescontroller");
const notesroutes = require("./routes/notes.route");
const cors = require("cors");

const app = express();
app.use(express.json());
//  app.use(cors("*")) -> this is used to allow access to all the origin, but if u want to allow specific origins then pass an obj specifying the address
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

dbconnection();

app.get("/", (req, res) => {
  res.send("yooo");
});

// app.use() is used to register middleware or mount a router at a specific path.

// the first is the path and the second is handler (The first argument is the base path, and the second argument is the middleware/router/handler that should handle matching requests.)

// by using this the api address is ->" /notes/create"
//  /path/name_of_the_api at the http method

// we have created 2 routes as of now i.e create and get so, the api address is

// 1. /notes/create ->creating notes
// 2./notes/allnotes ->get all notes

// conclucion is that
// Mounting related routes under a common base path keeps the API organized.
// For example, /notes becomes the base resource path, while individual router paths define operations such as /create or /:id.

app.use("/notes", notesroutes);

module.exports = app;
