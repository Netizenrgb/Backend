const app = require("./src/app");

app.get("/", (req, res) => {
  res.send("Yoo ts shyt is chill");
});

app.listen(3000, () => {
  console.log("Server is running on 3000");
});
