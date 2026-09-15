import "dotenv/config";
import { dbconnection } from "./src/config/db.js";

// we can use await directly without async when we use import (es module)
// this means that unless the connect db function is completed i.e the connection is established it wont move ahead and wont listen to req
// global await
await dbconnection();

import app from "./src/app.js";
let port = process.env.port;
app.listen(port, (req, res) => {
  console.log("Server is running ");
});
