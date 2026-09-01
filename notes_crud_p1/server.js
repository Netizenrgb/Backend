const app = require("./src/app");

let port = 3000;
app.listen(port, () => {
  console.log(`This is server is working on port ${port} `);
});
