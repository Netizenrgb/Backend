import configuri from "./src/config/config.js";
import app from "./app.js";

let Port = configuri.port;

app.listen(Port, (req, res) => {
  console.log(`server is running on ${Port}`);
});
