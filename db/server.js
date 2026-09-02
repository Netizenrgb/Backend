// this is the server/index file consist only the connection MVC archi

// connection

require("dotenv").config()
// in case the env fails the 4000 port will be used 
let port =process.env.port || 4000

const app = require("./src/app");
app.listen(port, () => {
  console.log("This is working on the port 3000 ");
});
