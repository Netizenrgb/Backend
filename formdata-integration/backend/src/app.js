const express = require("express");
const userroute = require("./route/user.route");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());
app.use("/user", userroute);
module.exports = app;
