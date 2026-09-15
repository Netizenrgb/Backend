# Understanding This Project: A Node.js + Express + MongoDB Authentication API

This document explains, in detail, what every file in this project does, how the pieces connect, and the underlying concepts (JWT, bcrypt, mongoose, middleware) so you understand *why* the code is written the way it is — not just *what* it does.

---

## 1. High-Level Overview

This is a small **backend authentication system** built with:

| Technology | Role |
|---|---|
| **Express** | Web framework — handles HTTP routes (`/api/auth/reg`, `/api/auth/login`, etc.) |
| **MongoDB + Mongoose** | Database + an ODM (Object Data Modeling library) to define and query the `User` collection |
| **bcryptjs** | Hashes passwords so plain-text passwords are never stored |
| **jsonwebtoken (JWT)** | Creates and verifies signed tokens used to prove "this user is logged in" |

The overall flow is:

1. A user **registers** → password gets hashed → user is saved to MongoDB → a JWT token is issued.
2. A user **logs in** → password is checked against the stored hash → a new JWT token is issued.
3. The user calls a **protected route** (`/api/auth/me`) → sends the JWT token → middleware verifies the token → attaches the user to the request → route handler responds with user data.

This is the classic **stateless authentication** pattern used in most modern APIs.

---

## 2. `db.js` — Database Connection

```js
import mongoose from "mongoose";

export const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mono_uri);
    console.log("DB connected");
  } catch (error) {
    console.log("Error in db connection -> ", error);
  }
};
```

### What it does
- `mongoose.connect(...)` opens a connection to a MongoDB database using a **connection string (URI)** stored in an environment variable (`process.env.mono_uri`).
- It's wrapped in a `try/catch` so that if the database is unreachable, the app logs the error instead of crashing outright.

### Concepts to know
- **Environment variables** (`process.env.X`): configuration values (like secrets, DB URLs) that live outside your source code — usually in a `.env` file — so you never hardcode sensitive data or environment-specific values into your code.
- **Mongoose**: a library that sits on top of MongoDB's native driver and lets you define **schemas** (structured shapes for your data) even though MongoDB itself is schema-less.
- **Async/await**: `mongoose.connect()` returns a `Promise` (connecting to a database takes time), so `await` pauses execution until the connection succeeds or fails.


---

## 3. `user.model.js` — The User Schema/Model

```js
import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const usermodel = mongoose.model("users", userschema);
export default usermodel;
```

### What it does
- Defines the **shape** of a "user" document: `name`, `email`, and `password`, all required strings.
- `mongoose.model("users", userschema)` compiles this schema into a **Model** — an object you use to create, read, update, and delete documents in the `users` collection.

### Concepts to know
- **Schema**: a blueprint describing what fields a document should have and their types/validation rules.
- **Model**: the actual interface you use to interact with the database (`usermodel.create()`, `usermodel.findOne()`, `usermodel.findById()`, etc.). Mongoose automatically pluralizes/lowercases the name you give (`"users"`), and this becomes the MongoDB collection name.
- **`required: true`**: a built-in validator — Mongoose will throw a validation error if you try to save a document missing that field.


---

## 4. `middleware.js` — Authentication Middleware

```js
import usermodel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authmiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token not found" });
  }

  const data = jwt.verify(authHeader, process.env.JWT_SECRET);

  const user = await usermodel.findById(data.id);
  console.log(user);

  req.user = user;

  next();
};
```

### What it does, step by step
1. **Reads the token** from the request's `Authorization` header (`req.headers.authorization`).
2. If there's no token at all, it immediately responds with **401 Unauthorized**.
3. **Verifies** the token using `jwt.verify(token, secret)`. This checks:
   - The token's signature was created using the server's `JWT_SECRET` (proving the server itself issued it, not a forged one).
   - The token hasn't been tampered with.
   - If verification fails, `jwt.verify` **throws an error**.
4. `data` is the **decoded payload** of the token — in this case `{ id: <user's MongoDB _id> }` (see `app.js`, where the token was signed with `{ id: user._id }`).
5. Uses that `id` to fetch the actual user document from the database via `usermodel.findById(data.id)`.
6. Attaches the found user to `req.user`, so **any route handler that runs after this middleware** can access `req.user` directly.
7. Calls `next()` to pass control to the next middleware/route handler in the chain.

### Concepts to know

#### What is Middleware?
In Express, **middleware** is a function that runs *between* the incoming request and the final route handler. It has access to `req`, `res`, and a special `next` function. Middleware can:
- Modify the request/response objects (like adding `req.user` here).
- End the request early (e.g., sending a 401 response).
- Or pass control forward by calling `next()`.

Middleware is what lets you write reusable logic (like "check if the user is logged in") once, and apply it to any route by just adding it as an argument:
```js
app.get("/api/auth/me", authmiddleware, async (req, res) => { ... });
```
Express runs `authmiddleware` first; only if it calls `next()` does the actual route handler run.

#### What is a JWT (JSON Web Token)?
A JWT is a compact, **self-contained** token used to represent a logged-in session without the server needing to store session data. It has three parts, separated by dots:

```
header.payload.signature
```

- **Header**: metadata (algorithm used, token type).
- **Payload**: the actual data you embedded (here, `{ id: userId }`) plus metadata like issue time.
- **Signature**: a cryptographic hash of the header + payload, created using a **secret key** known only to the server. This is what makes the token tamper-proof — if anyone changes the payload, the signature won't match anymore.

Because the server can **re-compute and check the signature** using its secret, it can trust the token's contents without querying a session database — this is why JWT-based auth is called **stateless**.

- `jwt.sign(payload, secret)` — creates a token.
- `jwt.verify(token, secret)` — checks the token's signature and returns the decoded payload if valid; **throws** if invalid or expired.
- `jwt.decode(token)` — just reads the payload **without verifying** the signature (insecure to trust for auth decisions — you saw this commented out in the code, and rightly not used).

---

## 5. `app.js` — Express App and Routes

```js
import express from "express";
import jwt from "jsonwebtoken";
import usermodel from "./models/user.model.js";
import { authmiddleware } from "./middleware/middleware.js";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
```

- `express()` creates the app instance.
- `app.use(express.json())` is **built-in middleware** that parses incoming requests with a `Content-Type: application/json` body, turning the raw request body into a usable JavaScript object accessible via `req.body`. Without this, `req.body` would be `undefined`.

### Route: `GET /api`
```js
app.get("/api", (req, res) => {
  return res.status(200).json({ message: "This api is working" });
});
```
A simple health-check endpoint to confirm the server is alive.

---

### Route: `POST /api/auth/reg` (Register)

```js
app.post("/api/auth/reg", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const user = await usermodel.create({
      email,
      name,
      password: await bcrypt.hash(password, 10),
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      message: "User Created",
      data: {
        user: { email, name, id: user._id },
        token,
      },
    });
  } catch (error) {
    console.log("Error in register api -> ", error);
  }
});
```

**Step by step:**
1. Extracts `email`, `name`, `password` from the JSON body.
2. **Hashes the password** with `bcrypt.hash(password, 10)` before saving — the database never stores the plain-text password.
3. Creates the user document in MongoDB via `usermodel.create(...)`.
4. Issues a JWT (`jwt.sign`) containing the new user's `_id`, signed with the server's secret.
5. Responds with `201 Created`, the basic user info, and the token — so the client can immediately be "logged in" after registering.

#### Concept: Why hash passwords with bcrypt?
- **Never store plain-text passwords.** If your database is ever compromised, plain-text passwords expose every user's real password (and likely their passwords elsewhere too, since people reuse passwords).
- `bcrypt.hash(password, saltRounds)`:
  - Generates a random **salt** (extra random data) and combines it with the password before hashing.
  - The **salt rounds** (here, `10`) control how computationally expensive the hashing is — higher = slower = more resistant to brute-force attacks, but also slower for your server.
  - Because of the random salt, hashing the *same* password twice produces **different** hash outputs each time. This is intentional — it prevents attackers from using precomputed "rainbow tables" to reverse common password hashes.
- To check a password later, you don't hash and compare hashes directly — you use `bcrypt.compare(plainPassword, storedHash)`, which internally re-derives the hash using the same salt embedded in `storedHash` and compares the results.


---

### Route: `POST /api/auth/login`

```js
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await usermodel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not Found" });
  }

  const isvalidpass = await bcrypt.compare(password, user.password);

  if (isvalidpass) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Logged in successfuly",
      data: { name: user.name },
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid Credentials" });
  }
});
```

**Step by step:**
1. Looks up the user by `email`.
2. If no user is found, responds with `400` (arguably this should be `404 Not Found`, though many APIs deliberately use a generic message/status to avoid revealing whether an email is registered — a security consideration called **not leaking user existence**).
3. Uses `bcrypt.compare(plainPassword, hashedPassword)` to check if the submitted password matches the stored hash.
4. If valid, issues a fresh JWT and returns it along with the user's name.
5. If invalid, responds with `400 Invalid Credentials`.



---

### Route: `GET /api/auth/me` (Protected Route)

```js
app.get("/api/auth/me", authmiddleware, async (req, res) => {
  try {
    console.log(req.user);
    return res.status(200).json({
      message: "User Found",
      data: { user: req.user },
    });
  } catch (error) {
    res.status(500).json({ message: "User not found" });
    console.log("user not found");
  }
});
```

This is where everything comes together:
- `authmiddleware` runs **first**. If the token is missing/invalid, the request is stopped there.
- If the token is valid, `authmiddleware` has already fetched the user and attached it as `req.user`.
- This route handler simply returns that user's data.

This demonstrates the core benefit of middleware: **the route handler itself doesn't need to know anything about tokens or verification** — that responsibility is cleanly separated into `authmiddleware`.

---

## 6. How All the Files Connect (Request Lifecycle)

Here's the full picture of what happens when a user registers, logs in, and then accesses a protected route:

```
1. Server startup:
   app.js  →  imports dbconnection() from db.js  →  connects to MongoDB

2. POST /api/auth/reg
   Client → app.js route handler
          → bcrypt.hash(password)        [hash password]
          → usermodel.create(...)         [save to MongoDB, using user.model.js schema]
          → jwt.sign({id: user._id})      [issue token]
          → respond with {user, token}

3. POST /api/auth/login
   Client → app.js route handler
          → usermodel.findOne({email})    [look up user]
          → bcrypt.compare(password, hash)[verify password]
          → jwt.sign({id: user._id})      [issue new token]
          → respond with {name, token}

4. GET /api/auth/me   (protected)
   Client → sends "Authorization: <token>" header
          → authmiddleware (middleware.js) runs FIRST:
                → jwt.verify(token, JWT_SECRET)   [check token is valid]
                → usermodel.findById(decoded.id)  [fetch fresh user data]
                → req.user = user
                → next()
          → app.js route handler runs:
                → responds with req.user
```

---

## 7. Key Concepts Recap

| Concept | Summary |
|---|---|
| **Express** | Minimal Node.js web framework for defining routes and middleware. |
| **Middleware** | A function that intercepts a request before the final handler; can short-circuit (send a response) or call `next()` to continue. |
| **Mongoose Schema/Model** | Defines structure/validation for MongoDB documents and gives you a query interface. |
| **bcrypt hashing** | One-way, salted hashing so passwords are never stored or transmitted in plain text; verified via `bcrypt.compare`, not by re-hashing and matching strings directly. |
| **JWT (sign/verify)** | A signed, tamper-evident token that encodes user identity, allowing **stateless** authentication — no server-side session storage needed. |
| **Authorization header** | Standard place to send the token in each authenticated request; conventionally prefixed with `Bearer `. |
| **Environment variables** | Used for secrets like `JWT_SECRET` and the MongoDB URI, keeping them out of source code. |

---
