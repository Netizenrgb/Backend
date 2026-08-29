let http = require("http");

let server = http.createServer((req, res) => {
  // if we have to create multiple endpoints this is one of the ways but not the corret method

  //   to solve this we use express js
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
