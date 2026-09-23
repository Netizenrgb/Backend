# URL Shortener — Complete Project Explanation

> A full-stack MERN-style web app (MongoDB + Express + React + Node.js) that turns long URLs into short codes, redirects visitors from the short link to the original, counts clicks, and lets you view and delete your links from a dark-themed dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Backend — File-by-File Deep Dive](#5-backend--file-by-file-deep-dive)
6. [Frontend — File-by-File Deep Dive](#6-frontend--file-by-file-deep-dive)
7. [API Reference](#7-api-reference)
8. [Database Design](#8-database-design)
9. [End-to-End Walkthroughs](#9-end-to-end-walkthroughs)
10. [Setup & Running the Project](#10-setup--running-the-project)
11. [Issues, Bugs & Risks Found](#11-issues-bugs--risks-found)
12. [Recommended Improvements & Roadmap](#12-recommended-improvements--roadmap)
13. [Key Concepts Demonstrated](#13-key-concepts-demonstrated)
14. [Quick File Summary Table](#14-quick-file-summary-table)

---

# 1. Project Overview

## 1.1 What is it?

This is a **URL shortener** (like Bitly or TinyURL). A user pastes a long link, the system creates a **6-character short code**, and anyone visiting `http://<server>/<code>` is redirected to the original link.

## 1.2 Core Features

- **Shorten a URL** — submit a long URL and get a unique short code.
- **Redirect** — visiting the short link sends the visitor to the original URL (HTTP 302).
- **Click tracking** — every redirect increments a `clicks_count` counter in the database.
- **List all links** — a dashboard table shows the original URL, short code, click count, and actions.
- **Delete a link** — remove a short URL from the database.
- **Input validation** — the backend checks that a URL exists, starts with `http://` or `https://`, and is at most 2048 characters.
- **Responsive UI** — built with Tailwind CSS; the table collapses to a card-style layout on mobile.

## 1.3 Who is it for?

It looks like a **learning / portfolio project** for practising a full-stack workflow: REST API design, Mongoose modelling, React state management, and Vite + Tailwind tooling.

---

# 2. Tech Stack

## 2.1 Backend

| Technology | Role in the project |
|---|---|
| **Node.js (ES Modules)** | JavaScript runtime. Uses `import`/`export` and top-level `await`, so `"type": "module"` must be set in `package.json`. |
| **Express** | Web framework: routing, JSON body parsing, redirects. |
| **Mongoose** | ODM (Object-Document Mapper) for MongoDB: schema, model, queries. |
| **MongoDB** | NoSQL database that stores the URL documents. |
| **dotenv** | Loads environment variables (the Mongo connection string) from a `.env` file. |
| **crypto** (built-in) | Imported in the code generator (see [issue #4](#114-medium-priority-issues) — imported but not actually used). |

## 2.2 Frontend

| Technology | Role in the project |
|---|---|
| **React** | UI library; uses functional components and hooks (`useState`, `useEffect`). |
| **Vite** | Dev server and bundler; also provides the **proxy** to the backend. |
| **@vitejs/plugin-react** | Enables React (JSX, fast refresh) in Vite. |
| **Tailwind CSS v4** | Utility-first styling via `@import "tailwindcss"` and the `@tailwindcss/vite` plugin. |
| **Axios** | HTTP client used to call the backend API. |

> **Note:** `package.json` files were **not** included in the zip. The dependency list above is inferred from the `import` statements in the code.

---

# 3. Project Structure

## 3.1 Important note about the zip

The uploaded zip is **flat** — all 11 files sit in a single `uploadgpt/` folder. However, the **import paths inside the files** (e.g. `../routes/url.routes.js`, `./config/db.js`) reveal the real folder layout used in the original project. The structure below is reconstructed from those imports.

## 3.2 Reconstructed layout

```text
url-shortener/
│
├── backend/
│   ├── .env                        # (not in zip) contains  mongouri=...
│   ├── package.json                # (not in zip)
│   ├── server.js                   # Entry point: connect DB, start server
│   │
│   ├── config/
│   │   ├── config.js               # Reads env variables
│   │   └── db.js                   # MongoDB connection function
│   │
│   ├── app/
│   │   └── app.js                  # Express app: middleware + routes + redirect
│   │
│   ├── routes/
│   │   └── url.routes.js           # POST / GET / DELETE API routes
│   │
│   ├── models/
│   │   └── url.model.js            # Mongoose schema & model
│   │
│   └── utils/
│       └── generate.code.js        # Random 6-char code generator
│
└── frontend/
    ├── package.json                # (not in zip)
    ├── vite.config.js              # Vite + React + Tailwind + API proxy
    └── src/
        ├── main.jsx                # React entry point
        └── app/
            ├── App.jsx             # Main UI component
            └── App.css             # Imports Tailwind
```

## 3.3 How the paths were deduced

| Evidence (import statement) | Conclusion |
|---|---|
| `server.js` → `./config/db.js` and `./app/app.js` | `server.js` sits at the backend root, next to `config/` and `app/` folders. |
| `app.js` → `../routes/url.routes.js` and `../models/url.model.js` | `app.js` is inside `app/`; `routes/` and `models/` are siblings of `app/`. |
| `url.routes.js` → `../utils/generate.code.js` | `utils/` is a sibling of `routes/`. |
| `db.js` → `./config.js` | `db.js` and `config.js` live together in `config/`. |
| `main.jsx` → `./app/App.jsx` and `./app/App.css` | Frontend has a `src/app/` folder holding the App component. |

---

# 4. Architecture & Data Flow

## 4.1 High-level architecture

```text
┌────────────────────┐        ┌──────────────────────┐        ┌──────────────┐
│   Browser (React)  │        │  Express API Server  │        │   MongoDB    │
│   Vite dev server  │        │      port 3000       │        │  (URL docs)  │
│     port 5173      │        │                      │        │              │
└─────────┬──────────┘        └──────────┬───────────┘        └──────┬───────┘
          │                              │                           │
          │  /api/*  (Vite proxy) ─────► │  Mongoose queries ──────► │
          │ ◄─────── JSON response ───── │ ◄──────── documents ───── │
          │                              │                           │
          │  http://localhost:3000/abc123 (direct, no proxy)         │
          │ ───────────────────────────► │  findOne + $inc clicks ─► │
          │ ◄── 302 Redirect to og_url ─ │                           │
```

## 4.2 Two different "kinds" of routes

The backend deliberately has **two route groups**:

1. **Management API** — mounted under `/api/url` (create, list, delete). Used by the React dashboard.
2. **Public redirect route** — `GET /:code`, defined directly on the app (not the router). It exists so that the short link is clean: `http://host/abc123` rather than `http://host/api/url/abc123`. This is explained by the author's own comment in `app.js`.

## 4.3 The Vite proxy

In development, the React app runs on **port 5173** and the API on **port 3000**. Browsers block cross-origin requests by default (CORS). Instead of configuring CORS, `vite.config.js` proxies any request starting with `/api` to `http://localhost:3000`. To the browser it looks like everything comes from `localhost:5173`, so no CORS setup is required.

---

# 5. Backend — File-by-File Deep Dive

## 5.1 `config/config.js` — Environment configuration

```js
import dotenv from "dotenv";
dotenv.config();

const configuri = {
  MONGO_URI: process.env.mongouri,
};
export default configuri;
```

### What it does
- `dotenv.config()` reads the `.env` file and puts each `KEY=value` pair into `process.env`.
- Exports a plain object `configuri` with one property, `MONGO_URI`, taken from the environment variable named **`mongouri`** (lower-case).

### Why it exists
Centralising environment access keeps secrets (the database password inside the connection string) **out of source code** and makes it easy to add more settings later (port, base URL, etc.).

### Example `.env`
```env
mongouri=mongodb://127.0.0.1:27017/urlshortener
```

---

## 5.2 `config/db.js` — Database connection

```js
import mongoose from "mongoose";
import configuri from "./config.js";

export async function dbconnection() {
  try {
    await mongoose.connect(configuri.MONGO_URI);
    console.log("DB connected");
  } catch (error) {
    console.log("Error in data base connection ");
  }
}
```

### What it does
- Exports an **async** function `dbconnection`.
- Calls `mongoose.connect()` with the URI. On success prints `DB connected`.
- On failure, prints an error message.

### Things to know
- The `catch` block **swallows** the error object (it isn't logged) and does **not** stop the process — so the server will still start even if the database is down. See [issue #6](#114-medium-priority-issues).

---

## 5.3 `server.js` — Application entry point

```js
import { dbconnection } from "./config/db.js";
import app from "./app/app.js";

await dbconnection();

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
```

### What it does
1. Connects to MongoDB first (`await` at the top level — this is why ES Modules are required).
2. Then starts the Express app listening on **port 3000** (hard-coded).

### Why this separation is good design
`server.js` (start the server) is split from `app.js` (define the app). That makes the app **testable** — a testing tool can import `app` without opening a real network port.

---

## 5.4 `app/app.js` — Express application & redirect logic

```js
const app = express();
app.use(express.json());
app.use("/api/url", router);

app.get("/:code", async function (req, res) { ... });

export default app;
```

### Line-by-line

| Code | Meaning |
|---|---|
| `express.json()` | Middleware that parses incoming JSON request bodies into `req.body`. Without it, `req.body.url` would be `undefined`. |
| `app.use("/api/url", router)` | Mounts all the routes from `url.routes.js` under the `/api/url` prefix. |
| `app.get("/:code", ...)` | A **dynamic route**. `:code` is a URL parameter, available as `req.params.code`. |

### The redirect handler — step by step

1. **Extract** the short code from the URL: `const { code } = req.params;`
2. **Look up** the document: `urlmodel.findOne({ short_code: code })`
3. **Not found?** → respond `404` with `{ message: "URL not found" }`.
4. **Found?** → `res.redirect(302, url.og_url)` sends the browser to the original site.
5. **Then** increment the counter: `findOneAndUpdate({ short_code: code }, { $inc: { clicks_count: 1 } })`.
6. **Error?** → the `catch` logs the error and returns `500` with `"Invalid url code"`.

### Why HTTP **302** and not 301?
- **301** = "moved permanently" — browsers **cache** it, so later visits skip your server and **clicks would no longer be counted**.
- **302** = "found / temporary" — browsers ask the server every time, which is what you need for analytics.

### What is `$inc`?
A MongoDB update operator that adds a number to a field **atomically** (safe even with concurrent clicks). The author's comment notes that `-1` would decrement.

### Why route order matters
`app.use("/api/url", router)` is registered **before** `app.get("/:code")`. Otherwise `/:code` could capture requests like `/api` first. Since it's placed last, API routes match first and everything else falls through to the redirect lookup.

---

## 5.5 `routes/url.routes.js` — REST API

The router defines three endpoints (all relative to `/api/url`).

### 5.5.1 `POST /` — Create a short URL

**Request body**
```json
{ "url": "https://example.com/some/very/long/path" }
```

**Validation chain (in order)**

| # | Check | Failure response |
|---|---|---|
| 1 | `url` is present | `400` — `{ error: "URL is required" }` |
| 2 | starts with `http://` or `https://` | `400` — `{ error: "Pls enter a valid URL" }` |
| 3 | length ≤ 2048 characters | `400` — `{ error: "URL is to looonnnggg" }` |

**On success**
1. Generate a code: `generatecode()`.
2. Save: `urlmodel.create({ og_url: url, short_code: code })`.
3. Respond `200`:

```json
{
  "message": "URL shorten successfully",
  "data": {
    "originalurl": "https://example.com/some/very/long/path",
    "short_code": "aB3xY9"
  }
}
```

**On unexpected error** → `500` `{ message: "Server Error" }`.

> Note the response key is **`originalurl`** — this matters for a frontend bug described in [issue #1](#112-high-priority-issues).

### 5.5.2 `GET /getlinks` — List all URLs

- Calls `urlmodel.find()` (no filter → **every** document).
- Responds `200`:

```json
{
  "message": "URLs fetched successfully",
  "data": {
    "urls": [
      {
        "_id": "665f...",
        "og_url": "https://example.com/...",
        "short_code": "aB3xY9",
        "clicks_count": 4,
        "createdAt": "2026-09-22T10:00:00.000Z",
        "updatedAt": "2026-09-22T10:05:00.000Z",
        "__v": 0
      }
    ]
  }
}
```

- On error → `500` (the error is logged twice, a small duplicate).

### 5.5.3 `DELETE /:id` — Delete a URL

1. Read `id` from `req.params` (this is the MongoDB `_id`, **not** the short code).
2. `findById(id)` — if nothing found → `404` `{ message: "URL not found" }`.
3. `findByIdAndDelete(id)` — removes it.
4. Respond `200` `{ message: "URL Deleted" }`.
5. Any error → `500` `{ message: "Server error" }`.

### Why is `/getlinks` declared before `/:id`?
Order matters in Express. It's a `GET` and `/:id` is a `DELETE`, so they don't actually clash here — but placing static paths before parameterised ones is a good habit.

---

## 5.6 `models/url.model.js` — Mongoose schema

```js
const urlschema = mongoose.Schema(
  {
    og_url:       { type: String, required: true },
    short_code:   { type: String, required: true },
    clicks_count: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const urlmodel = mongoose.model("URL", urlschema);
```

### Fields

| Field | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `og_url` | String | ✅ | — | The original (long) URL. `og` = "original". |
| `short_code` | String | ✅ | — | The 6-character code used in the short link. |
| `clicks_count` | Number | ❌ | `0` | How many times the short link was visited. |
| `createdAt` | Date | auto | now | Added by `timestamps: true`. |
| `updatedAt` | Date | auto | now | Added by `timestamps: true`; changes on each click (because `$inc` updates the doc). |
| `_id` | ObjectId | auto | — | Unique document id created by MongoDB. |

### The model
`mongoose.model("URL", urlschema)` creates a model named `URL`. MongoDB stores it in a collection called **`urls`** (Mongoose lowercases and pluralises the name).

> ⚠️ `short_code` is **not** marked `unique: true` and has no index — see [issue #3](#112-high-priority-issues).

---

## 5.7 `utils/generate.code.js` — Short code generator

```js
const generatecode = () => {
  const mainstring = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let shortcode = "";
  for (let i = 0; i < 6; i++) {
    shortcode += mainstring.charAt(Math.floor(Math.random() * 62));
  }
  return shortcode;
};
```

### How it works
1. The alphabet has **62 characters** (26 lowercase + 26 uppercase + 10 digits).
2. Loop **6 times**. Each time:
   - `Math.random()` gives a decimal from 0 up to (not including) 1.
   - `* 62` scales it to 0–61.999…
   - `Math.floor(...)` rounds down to an integer 0–61.
   - `charAt(index)` picks that character and appends it.
3. Return the 6-character string, e.g. `"k8Zq2P"`.

### The math
- Number of possible codes = 62⁶ = **56,800,235,584** (~56.8 billion).
- That's plenty of space, but collisions become likely much sooner than you'd think (birthday paradox — around ~280,000 links gives roughly a 50 % chance that *some* two codes match).

> ⚠️ The file imports `crypto` and its comment says crypto is used to generate random values, but the code actually calls `Math.random()`. See [issue #4](#114-medium-priority-issues).

---

# 6. Frontend — File-by-File Deep Dive

## 6.1 `vite.config.js` — Build & dev-server config

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { "/api": "http://localhost:3000" }
  }
});
```

| Piece | Purpose |
|---|---|
| `react()` | Adds JSX/React support and hot module reload. |
| `tailwindcss()` | The Tailwind v4 Vite plugin — processes Tailwind utility classes (no separate `tailwind.config.js` needed). |
| `server.proxy` | Any request to `/api/...` made to the Vite server (5173) is forwarded to the Express server (3000). |

---

## 6.2 `main.jsx` — React entry point

```jsx
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./app/App.css";

createRoot(document.getElementById("root")).render(<App />);
```

- Finds the `<div id="root">` in `index.html`.
- Creates a React 18+ root and renders the `<App />` component into it.
- Imports `App.css` so Tailwind's styles are included in the bundle.

---

## 6.3 `App.css` — Styling entry

```css
@import "tailwindcss";
```

One line. In Tailwind v4 this single import brings in all of Tailwind's base styles and utilities. All actual styling is done with utility classes directly in the JSX.

---

## 6.4 `App.jsx` — The main component

This is the only UI component — about 180 lines. It contains **state**, **API functions**, and **JSX markup**.

### 6.4.1 State variables

| State | Initial | Purpose |
|---|---|---|
| `urls` | `[]` | The list of all URL documents fetched from the backend; drives the table. |
| `inputvalues` | `""` | Controlled input: whatever the user is typing in the URL box. |
| `currenturl` | `null` | Intended to hold the most recently created short URL (currently set but **never displayed**). |

### 6.4.2 Functions

#### `fetchurls()`
- `GET http://localhost:5173/api/url/getlinks` via Axios.
- Reads `res.data.data.urls` and stores it in `urls` state.
- Errors are caught and logged to the console.

#### `useEffect(() => { fetchurls(); }, [])`
- The empty dependency array `[]` means this runs **once when the component first mounts**, loading the initial list.

#### `createShorturl()`
- `POST /api/url` with `{ url: inputvalues }`.
- Saves the response into `currenturl`.
- Calls `fetchurls()` to refresh the table.

#### `deleteurl(id)`
- `DELETE http://localhost:5173/api/url/${id}`.
- Calls `fetchurls()` to refresh the table.

### 6.4.3 UI sections (top to bottom)

#### 1. Page wrapper
`<main className="min-h-screen bg-neutral-950 text-white px-4 py-10 md:px-10">` — full-height near-black background with white text and responsive padding. Inside, a `max-w-5xl mx-auto` container centres the content.

#### 2. Heading
An `<h1>` "URL Shortener" and a grey subtitle: *"Create, manage and track your shortened URLs."*

#### 3. "Shorten URL" card
- A **controlled `<input>`** — `value={inputvalues}` plus `onChange` keeps React state in sync with the text box.
- Amber **Shorten** button → `onClick={() => createShorturl()}`.
- Layout: stacked on mobile (`flex-col`), side-by-side on desktop (`md:flex-row`).
- Focus styling: amber border and ring.

#### 4. URL list card
**Table header** (`hidden md:grid grid-cols-12`) — visible only on medium+ screens, with a 12-column grid:

| Column | Span | Content |
|---|---|---|
| Original URL | 5 | Truncated long URL (full URL shown on hover via `title`) |
| Short URL | 3 | Amber monospace link showing the short code |
| Clicks | 1 | Badge with `clicks_count` |
| Actions | 3 | Copy and Delete buttons |

**Empty state** — if `urls.length === 0`, shows *"No shortened URLs yet. Create your first shortened URL above."*

**Rows** — `urls.map(...)` renders one row per URL, with `key={url._id}` (the MongoDB id, which is a correct unique key).

- **Mobile** — small labels ("Original URL", "Short URL", "Clicks") appear above each value (`md:hidden`), because the header row is hidden.
- **Short link** — `<a href="http://localhost:3000/{short_code}" target="_blank" rel="noopener noreferrer">`. It opens in a new tab and hits the Express redirect route directly. `rel="noopener noreferrer"` is a good security practice.
- **Copy button** — styled but has **no `onClick` handler yet** (not implemented).
- **Delete button** — red-tinted; calls `deleteurl(url._id)`.

#### 5. Footer
Small grey text: *"Your shortened URLs and click statistics."*

### 6.4.4 Design language

| Element | Tailwind classes | Look |
|---|---|---|
| Background | `bg-neutral-950` | Almost-black |
| Cards | `bg-neutral-900 border-neutral-800 rounded-2xl shadow-lg` | Dark grey rounded panels |
| Accent colour | `amber-400` | Amber/yellow buttons, focus rings, links |
| Danger | `red-500/10`, `text-red-400` | Subtle red delete button |
| Interaction | `hover:`, `active:scale-95`, `transition` | Smooth hover and press effects |

---

# 7. API Reference

Base URL (dev): `http://localhost:3000` — or via the Vite proxy at `http://localhost:5173`.

| Method | Endpoint | Body | Success | Errors |
|---|---|---|---|---|
| `POST` | `/api/url` | `{ "url": "https://..." }` | `200` + `{ message, data: { originalurl, short_code } }` | `400` missing / invalid / too long, `500` |
| `GET` | `/api/url/getlinks` | — | `200` + `{ message, data: { urls: [...] } }` | `500` |
| `DELETE` | `/api/url/:id` | — | `200` + `{ message: "URL Deleted" }` | `404` not found, `500` |
| `GET` | `/:code` | — | `302` redirect to original URL | `404` not found, `500` |

### Example `curl` calls

```bash
# Create
curl -X POST http://localhost:3000/api/url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.wikipedia.org"}'

# List
curl http://localhost:3000/api/url/getlinks

# Follow a short link (shows the 302 header)
curl -i http://localhost:3000/aB3xY9

# Delete
curl -X DELETE http://localhost:3000/api/url/<mongo_id>
```

---

# 8. Database Design

## 8.1 Collection: `urls`

A sample document:

```json
{
  "_id": "665fa1b2c3d4e5f607182930",
  "og_url": "https://www.wikipedia.org",
  "short_code": "aB3xY9",
  "clicks_count": 4,
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T10:05:00.000Z",
  "__v": 0
}
```

## 8.2 Two identifiers — don't confuse them

| Identifier | Used for |
|---|---|
| `_id` | Internal MongoDB id. Used by the **DELETE** API and as the React `key`. |
| `short_code` | Public 6-char code. Used by the **redirect** route and shown in the UI. |

## 8.3 Access patterns

| Operation | Query | Frequency |
|---|---|---|
| Redirect | `findOne({ short_code })` | **Very high** (every click) |
| Click count | `findOneAndUpdate({ short_code }, { $inc })` | Very high |
| Dashboard | `find()` | Medium |
| Delete | `findById` / `findByIdAndDelete` | Low |

Because `short_code` is looked up on every click, it **should be indexed** (ideally `unique: true`, which creates a unique index automatically).

---

# 9. End-to-End Walkthroughs

## 9.1 Flow A — Creating a short URL

```text
1. User types  https://example.com/long/path  into the input.
        │  onChange updates `inputvalues` state
        ▼
2. User clicks "Shorten"  →  createShorturl()
        ▼
3. Axios  POST /api/url  { url: "https://example.com/long/path" }
        ▼
4. Vite dev server proxies  /api  →  http://localhost:3000
        ▼
5. Express  express.json()  parses body  →  router POST "/"
        ▼
6. Validation (present? http/https? ≤ 2048 chars?)
        ▼
7. generatecode()  →  "aB3xY9"
        ▼
8. Mongoose  create({ og_url, short_code })  →  saved in MongoDB
        ▼
9. Response 200  { data: { originalurl, short_code } }
        ▼
10. React sets `currenturl`, calls fetchurls()  →  table re-renders with the new row
```

## 9.2 Flow B — Someone clicks a short link

```text
1. Browser requests  GET http://localhost:3000/aB3xY9
        ▼
2. Express matches  app.get("/:code")   →  code = "aB3xY9"
        ▼
3. findOne({ short_code: "aB3xY9" })
        ├── not found → 404 { message: "URL not found" }
        ▼ found
4. res.redirect(302, og_url)   →  visitor lands on the original site
        ▼
5. findOneAndUpdate(... $inc: { clicks_count: 1 })   →  counter goes up
```

## 9.3 Flow C — Deleting a link

```text
1. User clicks "Delete" on a row  →  deleteurl(url._id)
        ▼
2. Axios  DELETE /api/url/<_id>
        ▼
3. Express router  findById  →  findByIdAndDelete
        ▼
4. Response 200 { message: "URL Deleted" }
        ▼
5. React calls fetchurls()  →  row disappears
```

## 9.4 Flow D — App start-up

```text
node server.js
   ├─ config.js runs dotenv.config()      → loads .env
   ├─ dbconnection()                      → mongoose.connect(MONGO_URI)
   └─ app.listen(3000)                    → "Server is running on 3000"

npm run dev  (frontend)
   └─ Vite starts on 5173 → loads main.jsx → renders <App /> → fetchurls()
```

---

# 10. Setup & Running the Project

> Since `package.json` files weren't included, these are **reasonable inferred steps**.

## 10.1 Prerequisites
- Node.js 18+ (20+ recommended)
- A running MongoDB instance (local or MongoDB Atlas)

## 10.2 Backend

```bash
cd backend
npm init -y
npm install express mongoose dotenv
```

In `package.json`, enable ES Modules:

```json
{
  "type": "module",
  "scripts": { "dev": "node --watch server.js" }
}
```

Create `.env`:

```env
mongouri=mongodb://127.0.0.1:27017/urlshortener
```

Run:

```bash
npm run dev
# DB connected
# Server is running on 3000
```

## 10.3 Frontend

```bash
cd frontend
npm create vite@latest . -- --template react
npm install axios tailwindcss @tailwindcss/vite
npm run dev
# Local: http://localhost:5173
```

## 10.4 Use it
1. Open `http://localhost:5173`.
2. Paste a URL starting with `http://` or `https://`, click **Shorten**.
3. Click the amber short code — it opens in a new tab and redirects.
4. Refresh the dashboard to see the click count go up.

---


---

# 11. Key Concepts Demonstrated

| Concept | Where it appears |
|---|---|
| **REST API design** (POST / GET / DELETE) | `url.routes.js` |
| **Express middleware** | `express.json()` in `app.js` |
| **Route parameters** (`:code`, `:id`) | `app.js`, `url.routes.js` |
| **Router modularisation** (`express.Router`) | `url.routes.js` mounted in `app.js` |
| **HTTP redirects & status codes** (302, 400, 404, 500) | `app.js`, `url.routes.js` |
| **Mongoose schema, model, timestamps** | `url.model.js` |
| **Atomic updates with `$inc`** | `app.js` |
| **Environment variables with dotenv** | `config.js` |
| **Separation of concerns** (config / routes / models / utils) | Folder layout |
| **ES Modules & top-level await** | `server.js` |
| **React hooks** (`useState`, `useEffect`) | `App.jsx` |
| **Controlled inputs** | URL input in `App.jsx` |
| **Conditional rendering & list rendering with keys** | Empty state / `urls.map` |
| **Dev proxy to avoid CORS** | `vite.config.js` |
| **Utility-first responsive CSS** | Tailwind classes (`md:`, `hover:`, etc.) |

## 11.1 Glossary

- **ODM** — Object-Document Mapper (Mongoose); maps JS objects to MongoDB documents.
- **Middleware** — a function that runs between the request arriving and the route handler.
- **Proxy** — a server that forwards requests to another server on your behalf.
- **CORS** — browser security rule that restricts cross-origin requests.
- **302 Redirect** — "temporary redirect"; browser must re-ask the server each time.
- **Atomic operation** — one indivisible database step; safe under concurrency.
- **Controlled component** — a React input whose value is owned by React state.

---

# 12. Quick File Summary Table

| File | Layer | Lines (approx.) | One-line purpose |
|---|---|---|---|
| `server.js` | Backend | 8 | Connects DB, starts server on port 3000. |
| `app.js` | Backend | 45 | Creates Express app, mounts API, handles `/:code` redirects + click counting. |
| `url.routes.js` | Backend | 100 | REST endpoints: create, list, delete URLs. |
| `url.model.js` | Backend | 22 | Mongoose schema for URL documents. |
| `generate.code.js` | Backend | 18 | Generates random 6-character alphanumeric codes. |
| `config.js` | Backend | 6 | Loads `.env` and exposes `MONGO_URI`. |
| `db.js` | Backend | 12 | Connects to MongoDB using Mongoose. |
| `vite.config.js` | Frontend | 13 | Vite setup: React + Tailwind plugins and `/api` proxy. |
| `main.jsx` | Frontend | 5 | Mounts `<App />` into the DOM. |
| `App.jsx` | Frontend | 180 | The entire dashboard UI + API calls + state. |
| `App.css` | Frontend | 1 | Imports Tailwind CSS. |

---

## Final Summary

This project is a **clean, well-organised foundation** for a URL shortener. The backend has sensible separation (config, routes, models, utils), the redirect logic is correct in concept (302 + atomic `$inc`), and the React dashboard is tidy, responsive, and visually polished.

To make it production-ready, the most valuable next steps are: **enforce short-code uniqueness**, **fix the `originalurl`/`og_url` mismatch**, **add frontend error handling**, **remove hard-coded URLs**, and **finish the Copy button**. After that, features like **authentication**, **custom aliases**, **link expiry**, and **detailed analytics** would turn it into a genuinely portfolio-worthy full-stack application.