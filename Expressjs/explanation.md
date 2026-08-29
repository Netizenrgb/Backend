Node.js HTTP Server vs Express.js

Overview

This project demonstrates two ways of creating a backend server in
Node.js:

Using Node's built-in http module --- server.js

Using Express.js --- express.js

Both approaches can create an HTTP server and respond to requests.

The important difference is how much work we have to do ourselves.

The http module gives us the low-level building blocks.

Express.js sits on top of Node's HTTP functionality and gives us a
cleaner, more structured way to build APIs and web servers.

Mental model: Node's http module gives you the engine. Express
gives you a much better dashboard and controls for building the
application.

1. server.js --- Using Node's Built-in HTTP Module

The server.js file uses Node's built-in http module:

let http = require("http");

let server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("This is the base url");
  }

  if (req.url === "/user") {
    res.end("This is the users url ");
  }

  if (req.url === "/contact") {
    res.end("This is the contact url ");
  }

  if (req.url === "/home") {
    res.end("This is the home url ");
  }
});

server.listen(3000, () => {
  console.log("This is working on 3000 port");
});

The code works. There is nothing inherently wrong with using Node's
http module.

The problem is that this approach becomes painful as the application
grows.

2. Importing the HTTP Module

let http = require("http");

http is a built-in Node.js module, so we do not need to install it
with npm.

It provides the low-level functionality required to create an HTTP
server.

We then use:

http.createServer()

to create the server.

3. Understanding createServer()

let server = http.createServer((req, res) => {
  // ...
});

The callback receives two important objects:

Request                         Response
   │                               │
   ▼                               ▼
  req  ──────── Server ─────────  res

req

req represents the incoming HTTP request.

It contains information such as:

requested URL

HTTP method

headers

request data

For example:

req.url

tells us which URL the client requested.

res

res represents the response we send back to the client.

For example:

res.end("Hello");

ends the response and sends "Hello" to the client.

4. Manual Routing

The current server.js performs routing manually:

if (req.url === "/") {
  res.end("This is the base url");
}

if (req.url === "/user") {
  res.end("This is the users url ");
}

The logic is basically:

Incoming Request
       │
       ▼
   Check req.url
       │
       ├── "/"       → response
       ├── "/user"   → response
       ├── "/contact"→ response
       └── "/home"  → response

For four routes, this is manageable.

But imagine an actual application with:

GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id

GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id

POST   /auth/login
POST   /auth/register
POST   /auth/logout

Now the manual routing approach starts becoming a giant collection of
conditions.

That's the real problem.

5. Why Manual http Routing Is Not a Practical Approach for Larger Applications

The http module itself is not bad.

In fact, Express ultimately works with Node's HTTP server underneath.

The issue is that when using the raw http API, we have to manually
handle many things that Express provides convenient abstractions for.

Problem 1 --- Manual Route Matching

We have to repeatedly write:

if (req.url === "/user") {
  // ...
}

As routes increase, the server becomes harder to read and maintain.

Express provides:

app.get("/user", (req, res) => {
  // ...
});

The intention is immediately obvious:

For a GET request to /user, execute this handler.

6. HTTP Methods Become Important

A URL alone does not define an API operation.

For example:

GET    /user
POST   /user
PUT    /user
DELETE /user

These can all use the same URL while performing completely different
operations.

The current server.js primarily checks:

req.url

It does not explicitly separate routes by HTTP method.

You would have to start building that logic yourself using things such
as:

req.method

This quickly becomes messy.

Express handles this much more naturally:

app.get("/user", handler);
app.post("/user", handler);
app.put("/user", handler);
app.delete("/user", handler);

7. Request Parsing and Other Repeated Work

As an API becomes real, requests contain more than a URL.

You may need to handle:

JSON request bodies

URL parameters

query parameters

headers

cookies

authentication

validation

errors

With the raw HTTP module, much of this needs to be implemented or wired
together manually.

Express provides abstractions and middleware for these common backend
tasks.

For example, JSON body parsing can be enabled with middleware:

app.use(express.json());

Then a JSON request body can be accessed through:

req.body

This is a major improvement in developer ergonomics.

8. express.js --- The Express Approach

The express.js file starts with:

const express = require("express");

let app = express();

Here we import the Express package and create an Express application.

The app object becomes the main interface for defining:

routes

middleware

request handling

responses

9. Defining a Route with Express

The project contains:

app.get("/", (req, res) => {
  res.send([
    // products...
  ]);
});

This is much more expressive than manually checking:

if (req.url === "/") {
  // ...
}

We are explicitly saying:

GET request
     +
 "/" URL
     ↓
run this handler

The route handler still receives:

(req, res)

So the fundamental request/response model from Node is still there.

Express is simply providing a much nicer abstraction around it.

10. app.get()

app.get("/", (req, res) => {
  // ...
});

The first argument:

"/"

is the route path.

The callback:

(req, res) => {}

is the route handler.

This handler runs when a client sends a GET request matching /.

For example:

GET http://localhost:3000/

will reach this route.

11. res.send()

The Express code uses:

res.send([
  {
    id: 1,
    title: "...",
    price: 109.95
  }
]);

The response is an array of JavaScript objects representing products.

Express's res.send() provides a convenient way to send the response.

When sending an object or array, Express handles the response formatting
rather than requiring us to manually construct the response in the same
low-level way as the Node HTTP API.

This makes API code much cleaner.

12. The Data Returned by the API

The / endpoint currently returns product data.

The structure looks like:

{
  id: 1,
  title: "...",
  price: 109.95,
  description: "...",
  category: "men's clothing",
  image: "...",
  rating: {
    rate: 3.9,
    count: 120
  }
}

There are 20 product objects in the response.

The endpoint therefore behaves like a simple product API.

A request to:

GET /

returns the product collection.

13. Starting the Express Server

At the bottom of express.js:

app.listen(3000, () => {
  console.log("This is running express js ");
});

This starts the application on port 3000.

Conceptually:

Client
  │
  │ GET /
  ▼
Express Application
  │
  │ route matching
  ▼
app.get("/")
  │
  │ res.send(...)
  ▼
Client receives response

14. Node HTTP vs Express

Node http                         Express

Low-level API                       Higher-level framework

Manual route checking               Dedicated route methods

More boilerplate                    Less boilerplate

Manual handling grows quickly       Designed for larger applications

You work directly with HTTP         Provides convenient abstractions
primitives

Middleware architecture must be     Middleware is a core concept
built/managed manually

The key point is not:

Node HTTP is bad and Express is good.

That's too simplistic.

The better mental model is:

Node HTTP is lower-level. Express is an abstraction built to make
common server-development tasks easier.

15. Express Does NOT Replace Node.js

This is an important distinction.

Express is not a replacement for Node.js.

The relationship is closer to:

Node.js
   │
   └── HTTP functionality
          │
          ▼
       Express
          │
          ▼
     Your API

Node provides the runtime and low-level capabilities.

Express provides a framework for organizing HTTP applications on top of
those capabilities.

16. Why Express Is More Feasible for Application Development

Imagine adding authentication to this project.

You may eventually need:

Authentication
Authorization
Validation
Logging
Error handling
Database
Routes
Controllers
Middleware
Request parsing
Response formatting

With raw Node HTTP, you would have to build a lot of the structure
yourself.

With Express, the architecture can naturally evolve into something like:

Application
│
├── Middleware
│
├── Routes
│
├── Controllers
│
├── Services
│
├── Database
│
└── Error Handler

That structure is far easier to maintain as the application grows.