const express = require("express");
const dbconnection = require("./config/db");


const app = express();

dbconnection();

app.get("/", (req, res) => {
  res.send("yoooo");
});

module.exports = app;
