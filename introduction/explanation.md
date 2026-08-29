Node.js Backend — Explanation

1. Creating the project

Create a folder and enter it:

mkdir backend
cd backend

Initialize npm:

npm init -y

This creates a package.json file for the project.

2. What does npm init -y mean?

npm = Node Package Manager.

npm init initializes a new Node.js project.

Without -y, npm asks questions such as:

package name

version

description

entry point

author

license

The -y flag means:

Accept the default answers automatically.

So:

npm init -y

quickly creates the initial package.json.

Mental model

Think of package.json as the configuration/manifest file of your Node.js project.

It stores information about:

project name

project version

scripts

dependencies

module type

entry point

3. package.json

The project currently has:

{
  "name": "introduction",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "nodemon": "^3.1.14"
  },
  "type": "commonjs"
}

name

"name": "introduction"

The name of the project/package.

version

"version": "1.0.0"

The current project version.

main

"main": "server.js"

Identifies the main entry file.

scripts

"scripts": {
  "start": "node server.js"
}

Scripts are shortcuts for commands.

Instead of:

node server.js

you can run:

npm start

dependencies

"dependencies": {
  "nodemon": "^3.1.14"
}

Records packages installed for the project.

type

"type": "commonjs"

This project uses the CommonJS module system, which is why code such as this works:

const http = require("http");

4. Installing Nodemon

The normal global installation command is:

npm install -g nodemon

The -g means global.

However, for a project, Nodemon is generally better installed locally as a development dependency:

npm install -D nodemon

-D is short for:

--save-dev

This means Nodemon is a tool needed during development rather than by the application itself.

npx i -g nodemon is not the normal installation command. npm install installs packages, while npx is mainly used to execute packages/commands.

5. What is Nodemon?

Normally, you start the server with:

node server.js

Node runs the JavaScript file and starts the server.

If you modify server.js, the currently running Node process does not automatically restart.

Without Nodemon:

Edit code
   ↓
Stop server
   ↓
Start server again

That gets annoying during development.

Nodemon solves this problem.

Run:

nodemon server.js

Nodemon watches the project files.

When it detects a change:

Edit server.js
      ↓
Nodemon detects change
      ↓
Node process restarts
      ↓
Updated code runs

Important mental model

Nodemon is not your HTTP server.

It is a development utility that watches files and restarts the Node process when changes are detected.

Nodemon
   ↓
starts/manages
   ↓
Node process
   ↓
HTTP server

Nodemon is mainly useful during development.

6. server.js

The current server code is:

const { log } = require("console");
let http = require("http");

let server = http.createServer((req, res) => {
  res.end("This is working on the browser");
});

server.listen(3000, () => {
  console.log("this is working on 3000 port");
});

Let's break it down.

Importing the HTTP module

let http = require("http");

http is a built-in Node.js module.

You do not need to install it using npm.

Node.js already provides it.

The HTTP module provides functionality for creating HTTP servers and handling HTTP requests/responses.

Creating the server

let server = http.createServer((req, res) => {
  res.end("This is working on the browser");
});

http.createServer() creates an HTTP server.

The callback receives:

(req, res)

This callback runs when a request reaches the server.

7. What is req?

req

means request.

It represents the incoming HTTP request.

For example, when you visit:

http://localhost:3000

the browser sends a request to your server.

The request can contain information such as:

HTTP method

URL/path

headers

request data

For example:

GET /

8. What is res?

res

means response.

It represents the response your server sends back to the client.

Here:

res.end("This is working on the browser");

sends the text back to the client and ends the response.

9. Request → Response flow

The basic flow is:

Browser
   |
   | HTTP request
   ↓
localhost:3000
   |
   ↓
Node HTTP server
   |
   ↓
(req, res)
   |
   ↓
res.end(...)
   |
   ↓
HTTP response
   |
   ↓
Browser

This request/response cycle is the foundation of web servers and APIs.

10. server.listen()

server.listen(3000, () => {
  console.log("this is working on 3000 port");
});

This tells Node to listen for incoming connections on port 3000.

You can access the server at:

http://localhost:3000

The callback runs after the server successfully starts listening.

11. What is port 3000?

A port identifies a network service running on your machine.

For example:

localhost:3000 → Backend server
localhost:5173 → Frontend development server
localhost:5432 → PostgreSQL

So:

server.listen(3000)

means:

Listen for incoming network requests on port 3000.

12. package-lock.json

When npm installs packages, it creates:

package-lock.json

The lockfile records the dependency tree and the versions involved in the installation.

For example, Nodemon has its own dependencies:

nodemon
 ├── chokidar
 ├── debug
 ├── minimatch
 ├── semver
 └── ...

Those dependencies are represented in the lockfile.

Should package-lock.json be pushed to GitHub?

Yes.

Normally commit:

package.json
package-lock.json

to Git.

Another developer can then clone the project and run:

npm install

to install the project's dependencies.

13. node_modules

When you install packages:

npm install

npm creates:

node_modules/

This directory contains the actual installed packages.

For example:

node_modules/
└── nodemon/

Nodemon itself has dependencies, so many other packages can appear inside node_modules.

Should node_modules be pushed to GitHub?

No.

Do not commit:

node_modules/

It can be recreated with:

npm install

Your repository only needs:

package.json
package-lock.json

to describe what needs to be installed.

14. .gitignore

.gitignore tells Git which files and folders it should not track.

A basic Node.js backend should ignore:

node_modules/

.env
.env.*
!.env.example

*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

.DS_Store
Thumbs.db

.vscode/
.idea/

coverage/

dist/
build/

The .gitignore rules are kept in a separate .gitignore file.

15. Why ignore .env?

Environment files can contain private information:

DATABASE_PASSWORD=secret
JWT_SECRET=secret
API_KEY=secret

You should not commit real secrets to GitHub.

Therefore:

.env

is important.

16. .env.example

A useful pattern is to have:

.env
.env.example

Real .env:

PORT=3000
DATABASE_URL=private-value
API_KEY=private-value

.env.example:

PORT=3000
DATABASE_URL=
API_KEY=

.env.example can be committed because it shows which variables are required without exposing the real secrets.

17. Recommended scripts

A cleaner package.json can contain:

"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

Now:

npm start

runs:

node server.js

And:

npm run dev

runs:

nodemon server.js

For development, use:

npm run dev

18. Complete setup from scratch

mkdir backend
cd backend
npm init -y
npm install -D nodemon

Create:

server.js
.gitignore

Add your server code to server.js.

Then add the development script:

"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

Start the development server:

npm run dev