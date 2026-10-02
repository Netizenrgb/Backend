import app from "./app/app.js";
import configuris from "./config/config.js";

let port = configuris.port;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
