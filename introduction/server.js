const { log } = require("console");
let http = require("http");

let server = http.createServer((req, res) => {
  res.end("This is working on the browser");
});

server.listen(3000, () => {
  console.log("this is working on 3000 port");
});
