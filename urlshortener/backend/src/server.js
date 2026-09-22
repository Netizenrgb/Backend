import { dbconnection } from "./config/db.js";
import app from "./app/app.js";

await dbconnection();

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
