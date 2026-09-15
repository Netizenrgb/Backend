import express from "express";
import jwt from "jsonwebtoken";
import usermodel from "./models/user.model.js";
import { authmiddleware } from "./middleware/middleware.js";
import bcrypt from "bcryptjs";

const app = express();

app.use(express.json());

app.get("/api", (req, res) => {
  return res.status(200).json({
    message: "This api is working",
  });
});

app.post("/api/auth/reg", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const user = await usermodel.create({
      email,
      name,
      // bcrypt.hash() hashes the user's plain-text password.
      // The second argument (10) is the salt rounds/cost factor.
      // A higher cost factor makes hashing slower and increases the
      // computational work required, making brute-force attacks more expensive.
      // However, it also consumes more CPU/time on our server.

      // IMPORTANT: bcrypt generates a random salt, so hashing the same
      // password again will NOT normally produce the same hash.
      //
      // During login, we don't hash the password and compare the two hashes.
      // Instead, bcrypt.compare() takes the plain-text password entered by
      // the user and the stored hash, then checks whether they match.

      //const isPasswordCorrect = await bcrypt.compare(
      //     password,
      //     user.password
      // );

      password: await bcrypt.hash(password, 10),
    });

    //   this .sign will create the token it accepts an obj and that obj will contain the detail of the user, whatever you want the token to store
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
    );

    res.status(201).json({
      message: "User Created",
      data: {
        user: {
          email,
          name,
          id: user._id,
        },
        token,
      },
    });
  } catch (error) {
    console.log("Error in register api -> ", error);
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await usermodel.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      message: "User not Found",
    });
    return;
  }

  const isvalidpass = await bcrypt.compare(password, user.password);

  if (isvalidpass) {
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
    );

    res.status(200).json({
      message: "Logged in successfuly",
      data: {
        name: user.name,
      },
      token,
    });
  } else {
    res.status(400).json({
      message: "Invalid Credentials",
    });
    return;
  }
});

app.get("/api/auth/me", authmiddleware, async (req, res) => {
  try {
    console.log(req.user);
    return res.status(200).json({
      message: "User Found",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "User not found",
    });
    console.log("user not found");
  }
});

export default app;
