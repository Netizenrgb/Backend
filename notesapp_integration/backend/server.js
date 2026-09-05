const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
let port = process.env.port || 4000;

app.listen(port, () => {
  console.log(`This server is running on port ${port}`);
});
