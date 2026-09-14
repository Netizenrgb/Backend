import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).json({
    message: "This api is working",
  });
});

app.post("/api/auth", (req, res) => {
  const { email, name, password } = req.body;

  //   this .sign will create the token it accepts an obj and that obj will contain the detail of the user whatever you want the tokento store
  const token = jwt.sign(
    {
      email,
      name,
    },
    "c8de3a162fefbc923ddd655093f8358f",
  );
  res.status(201).json({
    message: "User Created",
    data: {
      user: {
        email,
        name,
      },
      token,
    },
  });
});

export default app;
