import UserModel from "../model/user.js";
import bcrypt from "bcryptjs";
import { generatetokens } from "../utils/auth.js";

const regController = async (req, res) => {
  try {
    let { name, email, password, confirmpass } = req.body;

    const existinguser = await UserModel.findOne({ email });

    if (existinguser) {
      return res.status(409).json({
        message: "User already exist",
      });
    }

    const users = await UserModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });

    res.status(200).json({
      message: "Registrartion Successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "An unexpected server.",
    });
    console.log("Error in the register api -> ", error);
  }
};

export default regController;
