import { Router } from "express";
import usermodel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import {
  generatetokens,
  verifyaccesstoken,
  verifyrefreshtoken,
} from "../utils/auth.js";

const router = Router();

router.post("/reg", async (req, res) => {
   console.log("req.body ->", req.body);

  try {
    const { email, name, password } = req.body;

    const isuserexisting = await usermodel.findOne({ email });

    if (isuserexisting) {
      return res.status(400).json({
        message: "User already exists",
        error: {
          field: "Email",
          message: "User already exists",
        },
      });
    }

    const user = await usermodel.create({
      name,
      email,
      passwordhash: await bcrypt.hash(password, 12),
    });

    const { accesstoken, refreshtoken } = generatetokens({ userid: user._id });

    user.refreshtoken = refreshtoken;
    await user.save();

    // refresh token in cookie
    res.cookie("refreshtoken", refreshtoken, {
      // (httpOnly:true) , only the server can read the cookie , the client side js cant access the cookie
      httpOnly: true,
    });

    res.status(201).json({
      message: "USer registered",
      data: {
        name: user.name,
        email: user.email,
      },
      accesstoken,
    });
  } catch (error) {
    console.log("Error in register api -> ", error);
  }
});

router.get("/me", async (req, res) => {
  // Extract the JWT access token from the Authorization header.
  // The header is sent as "Bearer <token>", so split by the space
  // and take [1] to get only the actual token.
  // ?. prevents an error if the Authorization header is missing.
  const accesstoken = req.headers.authorization?.split(" ")[1];

  try {
    // verifyaccesstoken call
    const decoded = verifyaccesstoken(accesstoken);
    const user = await usermodel.findById(decoded.id);
    res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized invalid or expired access token ",
      error: {},
    });
  }
});

router.post("/refresh", async (req, res) => {
  console.log("🔥 REFRESH ROUTE HIT 🔥");
  console.log("cookies -> ", req.cookies);

  const refreshtoken = req.cookies.refreshtoken;

  console.log("REFRESH TOKEN:-> ", refreshtoken);

  if (!refreshtoken) {
    return res.status(401).json({
      message: "Invalid token ",
    });
  }

  try {
    const decode = await verifyrefreshtoken(refreshtoken);

    console.log("DECODED:-> ", decode);

    const user = await usermodel.findById(decode.id);
    console.log("USER:", user);

    if (refreshtoken !== user.refreshtoken) {
      user.refreshtoken = null;
      await user.save();

      return res.status(401).json({
        message: "Unauthorized token",
      });
    }

    const { accesstoken, refreshtoken: latestrefreshtoken } = generatetokens({
      userid: user._id,
    });

    res.cookie("refreshtoken", latestrefreshtoken, { httpOnly: true });

    user.refreshtoken = latestrefreshtoken;
    await user.save();

    res.status(200).json({
      message: "New tokens generated ",
      accesstoken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized token",
    });
  }
});

export default router;
