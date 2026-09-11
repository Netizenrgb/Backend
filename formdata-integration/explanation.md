# File Upload with Multer

This document explains the concepts used in this practice project: uploading files
(profile pictures) from a React frontend to an Express backend using **Multer**.

---

## 1. The Big Picture — How the Pieces Connect

```
App.jsx (React)          user.route.js (Express)       multer.file.js         user.controller.js
   |                             |                            |                        |
   | FormData (multipart/form)   |                            |                        |
   |----------------------------> POST /user/create ---------> upload.array("profilepic",5)
   |                             |                            | (Multer middleware runs |
   |                             |                            |  BEFORE controller)     |
   |                             |                            -------------------------> create(req,res)
   |                             |                                                       | reads req.body,
   |                             |                                                       | req.files
```

Key idea: **Multer is middleware**. It sits between the incoming HTTP request and your
route handler (`create`). By the time your controller runs, Multer has already parsed
the `multipart/form-data` request and attached the parsed text fields to `req.body` and
the parsed file(s) to `req.file` or `req.files`.

---

## 2. Why Multer Is Needed At All

A normal HTML/JS form with text fields sends `application/x-www-form-urlencoded` or
`application/json` data — Express's built-in `express.json()` can parse that.

But **files can't be represented as JSON or URL-encoded text**. Browsers send files
using a special encoding: `multipart/form-data`. This format splits the request body
into "parts" (one per field/file), each with its own headers and binary content.

Express does **not** know how to parse `multipart/form-data` on its own — that's the
gap Multer fills. Multer:
1. Parses the multipart body.
2. Separates plain text fields → puts them in `req.body`.
3. Separates uploaded files → puts them in `req.file` / `req.files`.

---

## 3. Frontend: Building a `multipart/form-data` Request (`App.jsx`)

```js
const formdata = new FormData();
formdata.append("name", data.name);
formdata.append("email", data.email);

for (let file of data.profilepic) {
  formdata.append("profilepic", file);
}

await axios.post("http://localhost:3000/user/create", formdata);
```

- `FormData` is a browser API that automatically builds a `multipart/form-data` payload.
- `data.profilepic` comes from `react-hook-form`'s `register`, and because the `<input type="file" multiple>` field can hold several files, it's a **FileList**, so the code loops and appends each file individually **under the same key** (`"profilepic"`).
- **Critical rule:** the field name used in `formdata.append("profilepic", file)` on the frontend **must exactly match** the field name given to Multer on the backend (`upload.array("profilepic", 5)`). If these don't match, `req.files` will come back empty/undefined.
- Note: you don't need to manually set the `Content-Type` header — the browser/axios sets `multipart/form-data; boundary=...` automatically when you pass a `FormData` object.

---

## 4. Backend: Configuring Multer (`multer.file.js`)

```js
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
```

Multer needs a **storage engine** — this decides *where the uploaded file's data goes*
before your controller sees it. There are two common engines:

### a) `multer.diskStorage()` (commented out in the file)
```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
```
- Saves the file **directly to disk** at the given `destination` folder, with a filename you control via the `filename` callback.
- `req.file` / `req.files` will contain metadata **plus a `path`** pointing to where the file now lives on disk.
- Good for: simple apps, or when you want to serve files straight from your server's filesystem.
- Downside: doesn't scale well across multiple servers/containers, and you must manage cleanup yourself.

### b) `multer.memoryStorage()` (what this project actually uses)
```js
const storage = multer.memoryStorage();
```
- Keeps the file **entirely in RAM**, as a `Buffer`, attached to `file.buffer`.
- **No file is written to disk** — nothing to clean up locally.
- Good for: when you immediately forward the buffer somewhere else, e.g. uploading to Cloudinary/S3/Firebase, resizing an image in memory, or storing it in a database as binary.
- Downside: large files or many concurrent uploads consume server memory — not ideal for huge files without limits.

| | diskStorage | memoryStorage |
|---|---|---|
| Where file lives | Written to disk | Held in RAM (`Buffer`) |
| Access it via | `file.path`, `file.filename` | `file.buffer` |
| Good for | Serving from local disk | Piping to cloud storage / DB / processing |
| Cleanup needed? | Yes (you manage files on disk) | No (garbage collected after request) |

---

## 5. `.single()` vs `.array()` — How Many Files Per Field

Multer gives you different middleware methods depending on how many files you expect
under one field name:

| Method | Use case | Where the file(s) end up |
|---|---|---|
| `upload.single("fieldName")` | Exactly **one** file for that field | `req.file` (a single object) |
| `upload.array("fieldName", maxCount)` | **Multiple** files, all under the *same* field name | `req.files` (an **array** of objects) |
| `upload.fields([{name, maxCount}, ...])` | Multiple **different** field names, each possibly with multiple files | `req.files` (an **object** keyed by field name) |
| `upload.none()` | No files at all, just text fields | Nothing — only `req.body` is populated |

In this project:
```js
upload.array("profilepic", 5)
```
- `"profilepic"` — the field name Multer looks for (must match the frontend's `formdata.append` key).
- `5` — the **maximum number of files** allowed in that field. If more than 5 are sent, Multer throws a `LIMIT_UNEXPECTED_FILE` / `MulterError`.

Compare with the single-file version referenced in comments:
```js
upload.single("profilepic")
```
This expects only **one** file, and it would show up at `req.file`, not `req.files`.

---

## 6. Accessing the Data in the Controller (`user.controller.js`)

```js
const create = (req, res) => {
  console.log(req.body);   // plain text fields: { name, email }
  console.log(req.files);  // array of file objects (because we used .array())
};
```

- `req.body` → populated by Multer with the **non-file** fields (`name`, `email`).
- `req.files` → an **array**, each element roughly looking like:
  ```js
  {
    fieldname: "profilepic",
    originalname: "photo.png",
    encoding: "7bit",
    mimetype: "image/png",
    buffer: <Buffer ...>,   // because we used memoryStorage
    size: 123456
  }
  ```
  (If `diskStorage` were used instead, each object would have `path`/`filename` instead of `buffer`.)
- If `upload.single(...)` had been used, you'd instead get **one object** at `req.file` (no `s`), and `req.files` would be `undefined`.

**Rule of thumb to remember:**
- `single` → `req.file` (singular, one object)
- `array` / `fields` → `req.files` (plural, array or object of arrays)

---

## 7. Route Wiring Recap (`user.route.js`)

```js
router.post(
  "/create",
  upload.array("profilepic", 5),  // Multer middleware runs first
  create,                         // then your controller runs
);
```

Express middleware runs **in order**. Multer's middleware parses the request and
attaches `req.body`/`req.files`, and only *then* calls `next()` internally, handing
control to `create`. This is why `create` can safely assume `req.body`/`req.files`
are already populated — it never has to parse anything itself.

---

## 8. Summary Cheat Sheet

- **Multer** = Express middleware for parsing `multipart/form-data` (needed for file uploads).
- **Storage engines**:
  - `diskStorage` → saves to disk, access via `file.path`.
  - `memoryStorage` → keeps in RAM as `Buffer`, access via `file.buffer`.
- **Upload methods**:
  - `.single(field)` → one file → `req.file`
  - `.array(field, max)` → many files, same field → `req.files` (array)
  - `.fields([...])` → many files, different fields → `req.files` (object)
- **Field name matching** between frontend `FormData.append(name, file)` and backend `upload.array("name", ...)` is mandatory.
- **Text fields** always land in `req.body`; **files** never do — they always go through Multer into `req.file`/`req.files`.