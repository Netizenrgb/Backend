# Notes CRUD API — Express + MongoDB

This is a small practice project for getting comfortable with a full CRUD REST API: Node, Express, MongoDB, Mongoose, dotenv — the usual starter stack. Nothing fancy, but it's a genuinely good project to understand line by line, because once this clicks, every other "resource" you add later (users, tasks, products, whatever) is basically the same pattern copy-pasted.

The project is split across a handful of files instead of one giant `app.js`, and that split is deliberate — server startup, app config, routing, business logic, and the database schema are all kept separate. Let's go through why.

---

## 1. The request lifecycle, in one picture

Before touching any code, here's the mental model to hold onto:

```
Client (Postman / frontend)
        ↓
    server.js        → starts the server
        ↓
      app.js          → configures Express, wires everything together
        ↓
  notes.route.js       → decides WHICH controller handles the request
        ↓
createnotescontroller.js → decides WHAT to actually do
        ↓
  notes.model.js        → decides HOW the data is shaped
        ↓
      MongoDB
```

Route → Controller → Model. That's the whole game. Everything below is just filling in the details of that sentence.

| File                       | Job                                            |
| -------------------------- | ---------------------------------------------- |
| `server.js`                | boots the HTTP server                          |
| `app.js`                   | builds and configures the Express app          |
| `notes.route.js`           | maps URLs + HTTP verbs to controller functions |
| `createnotescontroller.js` | the actual CRUD logic                          |
| `notes.model.js`           | the Mongoose schema/model for a note           |
| `db.js`                    | connects to MongoDB                            |

---

## 2. `server.js` — the entry point

```js
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");

let port = process.env.port || 4000;

app.listen(port, () => {
  console.log(`This server is running on port ${port}`);
});
```

`dotenv.config()` reads your `.env` file and dumps its contents into `process.env`. So if your `.env` has something like:

```env
mongodb_uri=mongodb://...
port=4000
```

you can now read `process.env.mongodb_uri` and `process.env.port` anywhere in the app. This is why nothing here is hardcoded — the connection string and port live outside the codebase, which matters the moment you push this to GitHub and don't want your DB credentials sitting in plain text.

`require("./src/app")` pulls in the fully-built Express app from `app.js`. Notice `server.js` doesn't define a single route itself — it only starts the thing. That split matters more than it looks like it does: it means you can `require("./src/app")` in a test file and hit routes with something like `supertest`, without ever actually spinning up a real server on a real port. Startup and configuration are two different jobs, and keeping them apart pays off later.

`app.listen(port, callback)` is the line that actually opens the door and starts accepting traffic.

---

## 3. `app.js` — where the app actually gets built

```js
const express = require("express");
const app = express();
```

`express()` gives you the app object everything else attaches to.

### The JSON middleware

```js
app.use(express.json());
```

Middleware is just a function that runs on every request before it reaches your route handler. This particular one parses incoming JSON bodies and makes the result available as `req.body`. So when Postman sends:

```json
{
  "title": "Learning Express",
  "description": "Learning how Express routes work"
}
```

that's what shows up as `req.body` inside your controller. Skip this line and `req.body` is just `undefined` — a classic first bug everyone hits once.

### Connecting to the DB

```js
dbconnection();
```

This is imported from `config/db.js` and kicks off the Mongoose connection. So `app.js` is doing two setup jobs at once: configuring Express, and getting the database ready.

### The root route

```js
app.get("/", (req, res) => {
  res.send("yooo");
});
```

Not much to say here — it's a sanity-check endpoint. Hit `GET /`, get back `yooo`, confirm the server is alive before you go debugging anything more complicated.

### Mounting the notes router

```js
app.use("/notes", notesroutes);
```

This is the line that ties routing together, and it's worth slowing down on. `notesroutes` is a whole file of routes like:

```js
router.post("/create", createnotescontroller);
router.get("/allnotes", getallnotescontroller);
```

When you mount that router at `/notes`, Express just glues the two path segments together. So `/create` becomes `/notes/create`, and `/allnotes` becomes `/notes/allnotes`. Read `app.use("/notes", notesroutes)` as: "anything starting with `/notes`, hand off to this router and let it figure out the rest."

---

## 4. `notes.route.js` — mapping URLs to logic

```js
const router = express.Router();
```

`express.Router()` gives you a mini standalone app just for routes — instead of cramming every endpoint into `app.js`, notes-related routes live together here. Cleaner, and it scales — when you eventually add a `users` resource, it gets its own router file too.

Here's the full set of routes and what they mean:

**Create**

```js
router.post("/create", createnotescontroller);
```

`POST /notes/create` — makes a new note. Handed off to `createnotescontroller`.

**Get all notes**

```js
router.get("/allnotes", getallnotescontroller);
```

`GET /notes/allnotes` — returns every note in the collection.

**Get a single note**

```js
router.get("/:id", singlenotecontroller);
```

The `:id` here is a route parameter — a placeholder in the URL. Hit `GET /notes/123` and inside the controller, `req.params.id` will be `"123"`. This is how you pass an identifier through the URL itself rather than the body.

**Update (PUT)**

```js
router.put("/:id", updatenotescontroller);
```

`PUT /notes/:id` — the note's ID comes from `req.params.id`, the new data comes from `req.body`.

**Partial update (PATCH)**

```js
router.patch("/:id/singlenote", updatenotespatchcontroller);
```

Same idea as PUT, different intent. PUT is conventionally "replace the resource," PATCH is "update a couple fields." In practice, with Mongoose, `findByIdAndUpdate` doesn't actually care which verb you used — the _convention_ is what separates them, not the underlying mechanics. Whether your PUT route actually behaves differently from your PATCH route comes down entirely to how you write the controller.

**Delete**

```js
router.delete("/:id", deletenotescontroller);
```

`DELETE /notes/:id` — removes the note with that ID.

---

## 5. `notes.model.js` — the shape of a note

```js
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
```

A schema is just a description of what a document is allowed to look like. Here, a note needs a `title` and a `description`, both strings, both required. `description` also has a minimum length.

Once the schema is compiled into a model with `mongoose.model("notes", notesSchema)`, you get an object with the built-in methods that do the actual database work: `.create()`, `.find()`, `.findById()`, `.findByIdAndUpdate()`, `.findByIdAndDelete()`. The schema describes the shape; the model is what you actually call.

---

## 6. `createnotescontroller.js` — where the real work happens

Despite the filename, this file holds _all_ the CRUD controllers, not just create. A little misleading, but that's the current state of things.

### Create

```js
const createnotescontroller = async (req, res) => {
  let { title, description } = req.body;

  let newnote = await NotesModel.create({
    title,
    description,
  });

  return res.status(201).json({
    message: "Note created successfully",
    data: newnote,
  });
};
```

Pull `title` and `description` out of the request body, pass them to `NotesModel.create()`, which builds _and_ saves the document in one call. `201 Created` is the right status code here — it specifically means "a new resource now exists," which is exactly what happened.

### Get all notes

```js
let getnotes = await NotesModel.find();
```

`find()` with no arguments returns every document in the collection. That's it — dump the whole list back to the client.

### Get one note

```js
let singlenoteid = req.params.id;
let note = await NotesModel.findById(singlenoteid);
```

The ID travels in through the URL (`req.params.id`), and `findById` looks up that one document.

### Update (PUT)

```js
let body = req.body;
let updatenotesid = req.params.id;

let updatednotes = await NotesModel.findByIdAndUpdate(updatenotesid, body, {
  new: true,
});
```

Three moving parts: which document (`updatenotesid`), what to change it to (`body`), and how to handle the response (`{ new: true }`).

That last option matters more than it looks like it should. By default, `findByIdAndUpdate` hands you back the document as it was _before_ the update ran — which trips people up constantly when they're testing in Postman and can't figure out why their update "didn't work" even though the database changed. `{ new: true }` tells Mongoose "actually give me the updated version."

### Partial update (PATCH)

```js
let patchupdate = await NotesModel.findByIdAndUpdate(noteid, body);
```

Same call, but notice `{ new: true }` is missing here. That means this endpoint updates the database correctly but can hand back stale data in the response — the update happened, the response just doesn't reflect it. If the intent is for PATCH to return the fresh document (and it should be), this needs the same `{ new: true }` treatment as PUT:

```js
const patchupdate = await NotesModel.findByIdAndUpdate(noteid, body, {
  new: true,
});
```

Worth remembering as a general rule: **whether the database gets updated, and what the query returns to you, are two separate things.** They don't automatically line up.

### Delete

```js
let delnotes = req.params.id;
await NotesModel.findByIdAndDelete(delnotes);
```

ID comes from the URL, `findByIdAndDelete` removes the matching document, and the controller responds with a success message.

---

## 7. `db.js` — connecting to MongoDB

```js
const mongoose = require("mongoose");

const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mongodb_uri);
    console.log("mongo db connected");
  } catch (error) {
    console.log("Error in db connection -> ", error);
  }
};
```

Straightforward: read the connection string out of `process.env.mongodb_uri` (which only exists because `dotenv.config()` already ran back in `server.js`) and connect. Wrapped in try/catch so a bad connection string logs an error instead of crashing the whole app on boot.

---

## 8. Walking through one full request

Say Postman fires off:

```
POST /notes/create
```

with body:

```json
{
  "title": "Node.js",
  "description": "Learning backend development"
}
```

Here's everywhere that request touches before a response comes back:

```
POST /notes/create
     → Express app receives it
     → app.use("/notes", notesroutes) matches
     → router.post("/create", createnotescontroller) matches
     → controller reads req.body
     → NotesModel.create({ title, description })
     → Mongoose sends it to MongoDB
     → document gets saved, comes back with an _id
     → res.status(201).json({...}) sends the response
```

That's the whole architecture in motion. Once this sequence makes sense for one endpoint, all six follow the identical pattern with different verbs and slightly different logic.

---

## 9. Endpoint cheat sheet

| Operation      | Method   | Endpoint                | Controller                   |
| -------------- | -------- | ----------------------- | ---------------------------- |
| Create note    | `POST`   | `/notes/create`         | `createnotescontroller`      |
| Get all notes  | `GET`    | `/notes/allnotes`       | `getallnotescontroller`      |
| Get one note   | `GET`    | `/notes/:id`            | `singlenotecontroller`       |
| Update note    | `PUT`    | `/notes/:id`            | `updatenotescontroller`      |
| Partial update | `PATCH`  | `/notes/:id/singlenote` | `updatenotespatchcontroller` |
| Delete note    | `DELETE` | `/notes/:id`            | `deletenotescontroller`      |

---

## 10. `server.js` vs `app.js`, one more time

This split confuses people early on, so it's worth stating plainly:

- **`server.js`** — loads env vars, imports the app, starts listening on a port. That's genuinely it.
- **`app.js`** — builds the Express instance, wires up middleware, mounts routes, kicks off the DB connection, and exports the finished app.

The payoff: `app.js` can be imported and tested completely independently of actually running a live server on a live port. That separation feels like overkill on a five-file practice project, but it's the same shape you'll use on something much bigger later, so it's worth internalizing now rather than relearning it under pressure.

---

## 11. The actual takeaway

Don't think of this as six separate files . Think of it as one repeating shape:

```
Request → Route → Controller → Model → MongoDB → Response
```

Every endpoint in this project is that same sentence with the details swapped out. Once you can trace a `POST /notes/create` request through every file without looking anything up, you already understand this project. Adding a `users` or `tasks` resource later isn't new knowledge — it's the exact same architecture, copy-pasted and renamed.

What this project actually teaches, underneath the CRUD boilerplate: Express app structure, middleware, routers and route params, the six core HTTP verbs, Mongoose schemas and models, `.env` handling, and a handful of very real Mongoose gotchas (`{ new: true }`, `runValidators`) that trip up almost everyone the first time they touch an update endpoint.
