import app from "./app.js";
import { connectdb } from "../../config/db.js";

// it wont start the server untill the db connection is successful 
await connectdb();

app.listen(3000, (req, res) => {
  console.log("Serve is running on 3000");
});
