# Notes CRUD App — How It Works

**Stack:** React + Axios (frontend) · Node/Express (backend) · MongoDB + Mongoose (database) · dotenv (config)

The real lesson here isn't CRUD syntax — it's the *path a request travels*:

```
React UI → Axios → Express → Router → Controller → Mongoose Model → MongoDB
                                                                        │
UI ← React state ← Axios (response) ←──────────────────────────────────┘
```

Once you can trace that loop for one resource (notes), the same pattern applies to any resource — users, tasks, products, etc.

---

## 1. Backend: Layered Responsibility

Each file has exactly one job. This separation is what makes the app maintainable:

| File | Job |
|---|---|
| `server.js` | Starts the HTTP server |
| `app.js` | Configures Express (middleware, routes, DB connection) |
| `notes.route.js` | Maps URLs → controller functions |
| `*controller.js` | Business logic: read request, call model, send response |
| `notes.model.js` | Defines the document shape + gives you query methods |
| `db.js` | Connects Mongoose to MongoDB |
| `.env` | Secrets/config, kept out of source control |

**Mental model:** `Route → Controller → Model → Database`. Routes decide *where* a request goes; controllers decide *what to do*; models decide *how to talk to Mongo*.

### server.js — just the entry point
```js
dotenv.config();
const app = require("./src/app");
app.listen(process.env.port || 4000);
```
`dotenv.config()` loads `.env` into `process.env`, so secrets never live in code. `server.js` stays thin on purpose — it can be swapped out (e.g., for tests) without touching app logic.

### app.js — the Express app
```js
const app = express();
app.use(express.json());   // parses JSON bodies into req.body
dbconnection();             // connects to MongoDB (logic lives in db.js)
app.use("/notes", notesroutes);
```
`app.use("/notes", notesroutes)` means every route defined in the router is *prefixed* with `/notes`. So `router.post("/create", ...)` becomes `POST /notes/create`.

### db.js — the connection
```js
await mongoose.connect(process.env.mongodb_uri);
```
Chain: `.env → dotenv → process.env.mongodb_uri → mongoose.connect() → MongoDB`.

---

## 2. Routes → Controllers

| Operation | Method | Endpoint |
|---|---|---|
| Create | POST | `/notes/create` |
| Get all | GET | `/notes/allnotes` |
| Get one | GET | `/notes/:id` |
| Replace | PUT | `/notes/:id` |
| Partial update | PATCH | `/notes/:id/singlenote` |
| Delete | DELETE | `/notes/:id` |

`:id` is a **route parameter** — Express extracts it into `req.params.id`. So `GET /notes/65abc123` gives the controller `req.params.id === "65abc123"`.

Routers should only *dispatch* — no database logic belongs here.

---

## 3. The Model — Schema vs. Model

```js
const notesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, minlength: 5, required: true },
});
const NotesModel = mongoose.model("notes", notesSchema);
```
- **Schema** = shape and validation rules for the data.
- **Model** = the object that actually talks to MongoDB (`.create()`, `.find()`, `.findById()`, `.findByIdAndUpdate()`, `.findByIdAndDelete()`).

---

## 4. Controllers — CRUD in Practice

**Create**
```js
const { title, description } = req.body;
const newnote = await NotesModel.create({ title, description });
return res.status(201).json({ data: newnote });
```
`201` because a resource was created.

**Read all / one**
```js
const notes = await NotesModel.find();          // all
const note  = await NotesModel.findById(req.params.id); // one
```

**Update — PUT vs PATCH**
- `PUT /notes/:id` → conventionally a full replace.
- `PATCH /notes/:id/singlenote` → partial update (what this app actually uses).

```js
const updated = await NotesModel.findByIdAndUpdate(id, body, { new: true });
```
`id` = *which* document, `body` = *what changes*, `{ new: true }` = return the **post-update** document. Skip that option and Mongoose hands back the stale, pre-update version — the write still succeeded, you just didn't see it.

**Delete**
```js
await NotesModel.findByIdAndDelete(req.params.id);
```

---

## 5. Frontend Structure

```
App
 ├── CreateNotes      (owns the create form)
 └── ViewAllNotes      (owns the notes array + fetch/delete/update calls)
       └── Viewnote × N (display + edit UI for one note)
```
`ViewAllNotes` owns `allnotes` state because it owns the *collection*. It also owns the API functions (`getallnotes`, `delnotes`, `updatenote`) and passes them down as props — `Viewnote` itself has no idea how the network calls work, it just calls the functions it's given.

### Create
Controlled inputs write to `formvalues` on every keystroke; submit fires:
```js
await axios.post("http://localhost:3000/notes/create", formvalues);
```

### Read (on mount)
```js
useEffect(() => { getallnotes(); }, []); // empty deps = run once, on mount
```
```js
const res = await axios.get(".../notes/allnotes");
setAllnotes(res.data.data);
```

### Delete
```js
await axios.delete(`.../notes/${id}`);
getallnotes(); // re-fetch, because React state doesn't auto-sync with the DB
```

**Why `onClick={() => delnotes(id)}` and not `onClick={delnotes(id)}`?**
The arrow function version hands React a function *to call later*, on click. Without the arrow, `delnotes(id)` executes immediately during render — React ends up with `onClick={undefined}` (or whatever `delnotes` returns) instead of a handler.

### Update (the more involved one)

Each `Viewnote` has local state for editing:
```js
const [isEditing, setIsEditing] = useState(false);
const [formvalues, setFormvalues] = useState({
  title: notes.title,
  description: notes.description,
});
```

Flow:
```
Click "Update" → isEditing = true → edit form shown
User edits inputs → formvalues updates (controlled inputs)
Click "Save" → handleUpdate() → updatenote(notes._id, formvalues)
   → axios.patch(`/notes/${id}/singlenote`, formvalues)
   → backend updates Mongo → getallnotes() refreshes the list
   → setAllnotes() → React re-renders → new values on screen
```

`updatenote(id, updatedData)` — the two arguments answer two separate questions: *which* document (`id`, from the URL) and *what should it become* (`updatedData`, the body).

---

## 6. Why Re-fetch After Every Write?

MongoDB is updated the moment the request succeeds, but React's `allnotes` state is just a snapshot in memory — it has no idea the database changed. Calling `getallnotes()` after create/update/delete pulls a fresh snapshot and re-renders. It's simple and correct for a small app; a further optimization would be updating `allnotes` locally instead of re-fetching, but that's an added layer of complexity, not a requirement.

---

## 7. The Frontend/Backend Contract

Nothing links these two codebases except agreement on shape and URLs:
- Frontend sends `{ title, description }` → backend must read `req.body.title` / `req.body.description`.
- Frontend calls `PATCH /notes/:id/singlenote` → backend must expose *exactly* that route.

Mismatch either one (wrong field name, wrong path) and the integration breaks even though each side works fine in isolation. This is what "API contract" means in practice.

---