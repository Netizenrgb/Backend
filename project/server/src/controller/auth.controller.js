import usermodel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createaccesstoken, createrefreshtoken } from "../utils/auth.utils.js";

const regcontroller = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existinguser = await usermodel.findOne({ email });

    if (existinguser) {
      return res.status(400).json({
        message: "User already exists with email address",
        errors: [
          {
            field: "email",
            message: "User already exists",
          },
        ],
      });
    }

    const user = await usermodel.create({
      email,
      name,
      password: await bcrypt.hash(password, 12),
    });

    const access_token = createaccesstoken({
      user: user._id,
      role: user.role,
    });

    const refresh_token = createrefreshtoken({
      user: user._id,
      role: user.role,
    });

    res.status(200).json({
      message: "User registered successfully",
      access_token: access_token,
    });
  } catch (error) {
    console.log("Error in the register api -> ", error);
  }
};

export default regcontroller;
