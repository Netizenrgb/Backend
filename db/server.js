// this is the server/index file consist only the connection MVC archi

// connection
const app = require("./src/app");
app.listen(3000, () => {
  console.log("This is working on the port 3000 ");
});
