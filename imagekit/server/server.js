import app from "./src/app.js";
import connectdb from "./src/config/db.config.js";

connectdb();
let port = process.env.port || 4000;
app.listen(port, (req, res) => {
  console.log(`The Image kit is working on ${port} `);
});
