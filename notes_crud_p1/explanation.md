# Notes API — Full Explanation

This document breaks down your Node.js + Express + MongoDB (Mongoose) project: what each file does, what every line/comment means, and the core REST API concepts (GET, POST, PUT, DELETE) — including which ones your code currently has and which ones are missing.

---

## 1. The Big Picture — How This App Works

This is a **backend REST API server**. It doesn't have a frontend/UI — it just exposes URLs (endpoints) that a frontend, mobile app, or tool like Postman can send requests to.

The flow is:

```
Client (Postman/Frontend)
        |
        v
   server.js  (boots the server, picks a port)
        |
        v
     app.js   (Express app: routes + middleware)
        |
        v
      db.js   (connects to MongoDB via Mongoose)
        |
        v
 note.model.js (defines the "shape" of a Note document)
        |
        v
     MongoDB   (actual database storage)
```

---

## 2. Core Concept: REST APIs & HTTP Methods

REST (Representational State Transfer) is a convention for designing APIs around **resources** (here, the resource is a "note"). Each HTTP method has a specific meaning ("CRUD" = Create, Read, Update, Delete):

### GET — Read

- Used to **fetch/retrieve** data.
- Should never change anything on the server (no side effects).
- Example: `GET /notes` → return all notes. `GET /notes/:id` → return one note.

### POST — Create

- Used to **create a new resource**.
- Data is sent in the **request body** (`req.body`), not the URL.
- Example: `POST /create` → create a new note.

### PUT — Update / Replace

- Used to **update an existing resource**, usually replacing it entirely with new data.
- Needs an identifier (usually in the URL, e.g. `/notes/:id`) plus the new data in the body.
- (`PATCH` is the "update only some fields" cousin of `PUT`.)
- Your code does **not** have this yet — see section 6 for how you'd add it.

### DELETE — Remove

- Used to **delete a resource**, identified by something like an ID in the URL.
- Example: `DELETE /notes/:id` → remove that note from the database.
- Your code does **not** have this yet either — see section 6.

### Quick Reference Table

| Method | Purpose        | Data Location      | Idempotent? |
| ------ | -------------- | ------------------ | ----------- |
| GET    | Read data      | URL (query/params) | Yes         |
| POST   | Create data    | Request body       | No          |
| PUT    | Update/replace | URL (id) + body    | Yes         |
| DELETE | Remove data    | URL (id)           | Yes         |

_(Idempotent = calling it multiple times has the same effect as calling it once.)_

---

## 3. File-by-File Breakdown

### `server.js` — The Entry Point

```js
require("dotenv").config();
```

Loads environment variables from a `.env` file (like your MongoDB URI and port number) into `process.env`. This keeps secrets/config out of your code.

```js
const app = require("./src/app");
```

Imports the actual Express application (all the routes/logic) from `app.js`. `server.js` itself doesn't define any routes — its only job is to **start** the server.

```js
let port = process.env.port || 4000;
app.listen(port, () => {
  console.log(`This is server is working on port ${port} `);
});
```

- Reads the port from the environment variable, or defaults to `4000` if none is set.
- `app.listen(port, callback)` starts the HTTP server and begins listening for incoming requests on that port.

---

### `app.js` — The Express Application (Routes Live Here)

```js
const express = require("express");
const dbconnection = require("./config/db");
const NoteSchema = require("./models/note.model");
const app = express();
```

- Imports Express (the web framework).
- Imports the DB connection function and the Note model.
- `express()` creates the actual app instance — this is what handles incoming requests.

```js
app.use(express.json());
```

This is **middleware**. It tells Express to automatically parse incoming JSON request bodies into a JS object, available as `req.body`. Without this line, `req.body` would be `undefined` and your `POST /create` route would break.

```js
dbconnection();
```

Calls the function that connects to MongoDB (defined in `db.js`). This runs once when the app starts.

```js
app.get("/", (req, res) => {
  res.send("Crud ");
});
```

- **GET route** at the root path `/`.
- Just a simple health-check/"is the server alive" route — sends back plain text.

```js
app.post("/create", async (req, res) => {
  const { title, description } = req.body;

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
```

This is the core **POST (Create)** route:

1. **Destructures** `title` and `description` out of the incoming JSON body.
2. `NoteSchema.create({...})` is a Mongoose method that both builds a new document **and** saves it to MongoDB in one step. It's asynchronous (returns a Promise), so `await` pauses execution until it's actually saved.
3. Sends back a JSON response confirming success, along with the newly created note (which now includes MongoDB's auto-generated `_id`, timestamps if any, etc.)

Exports the configured app so `server.js` can import and run it.

---

### `note.model.js` — The Data Schema (Blueprint for a "Note")

```js
const mongoose = require("mongoose");
```

Mongoose is a library that sits on top of MongoDB and lets you define **schemas** (structure + validation rules) instead of just throwing raw, unstructured objects into the database.

```js
let notesScheme = new mongoose.Schema({
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
```

This defines what a "note" document must look like:

- `title`: must be a String, and is **required** (can't create a note without it).
- `description`: must be a String, **required**, and must be **at least 10 characters** (`minlength: 10`). This is Mongoose-level validation — it happens before anything is actually saved to MongoDB.

```js
const NoteSchema = mongoose.model("notes", notesScheme);
```

`mongoose.model(collectionName, schema)` compiles the schema into a usable **Model** — an object with built-in methods like `.create()`, `.find()`, `.findById()`, `.findByIdAndUpdate()`, `.findByIdAndDelete()`, etc. Mongoose will actually store this in a MongoDB collection called `notes` (it auto-pluralizes/lowercases the name you give it).

> Naming note: the variable here is called `NoteSchema`, but it's actually the **Model**, not the schema itself (the schema is `notesScheme`, defined above it). This works fine, but can be confusing — a clearer name would be `NoteModel`.

```js
module.exports = NoteSchema;
```

Exports the model so `app.js` can use it to create/read/update/delete notes.

---

### `db.js` — Database Connection

```js
const mongoose = require("mongoose");

const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
  } catch (error) {
    console.log(error);
  }
  console.log("Mongoose connected ");
};

module.exports = dbconnection;
```
---

## 4. Middleware — What It Means

You'll see the term "middleware" a lot in Express. Middleware is just a function that runs **between** the incoming request and your final route handler. It has access to `req`, `res`, and a `next()` function to pass control along.

In your code, `app.use(express.json())` is middleware that runs on **every** request, parsing JSON bodies before your route handlers ever see them.

---

## 5. What's Missing — GET (all/one), PUT, and DELETE

Right now your API can only create notes and hit the root health-check route. A complete CRUD API for notes would also need:

```js
// GET all notes
app.get("/notes", async (req, res) => {
  try {
    const notes = await NoteSchema.find();
    res.send({ success: true, data: notes });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// GET a single note by id
app.get("/notes/:id", async (req, res) => {
  try {
    const note = await NoteSchema.findById(req.params.id);
    res.send({ success: true, data: note });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// PUT (update) a note by id
app.put("/notes/:id", async (req, res) => {
  try {
    const updatedNote = await NoteSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.send({ success: true, data: updatedNote });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// DELETE a note by id
app.delete("/notes/:id", async (req, res) => {
  try {
    await NoteSchema.findByIdAndDelete(req.params.id);
    res.send({ success: true, message: "Note deleted" });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});
```

Key things to notice:

- `:id` in the route path is a **route parameter** — accessed via `req.params.id`.
- `{ new: true }` in `findByIdAndUpdate` tells Mongoose to return the **updated** document instead of the old one.
- `{ runValidators: true }` makes sure your schema rules (like `minlength: 10`) are still enforced on update.
- All of these are wrapped in `try/catch` so errors return a proper response instead of crashing.

---

## 6. Summary

| File            | Responsibility                                   |
| --------------- | ------------------------------------------------ |
| `server.js`     | Starts the HTTP server on a given port           |
| `app.js`        | Defines the Express app, middleware, and routes  |
| `note.model.js` | Defines the Note schema/model + validation rules |
| `db.js`         | Connects to MongoDB using Mongoose               |

Your app currently supports:

- ✅ `GET /` — health check
- ✅ `POST /create` — create a note
