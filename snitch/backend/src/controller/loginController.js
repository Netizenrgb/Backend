import UserModel from "../model/user.js";
import bcrypt from "bcryptjs";
import { generatetokens } from "../utils/auth.js";
import configuri from "../config/config.js";

export const logincontroller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const logeduser = await UserModel.findOne({ email });

    if (!logeduser) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isvalidpass = await bcrypt.compare(password, logeduser.password);

    if (!isvalidpass) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const { accesstoken, refreshtoken } = generatetokens({
      userid: logeduser._id,
    });

    logeduser.refresh_token = refreshtoken;
    await logeduser.save();

    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      accesstoken,
    });
  } catch (error) {
    console.log("Error in login api -> ", error);
    res.status(500).json;
  }
};
