import usermodel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  createaccesstoken,
  createrefreshtoken,
  verifyrefresgtoken,
} from "../utils/auth.utils.js";

const regcontroller = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
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
      role,
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

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
    });

    await usermodel.findOneAndUpdate(user._id, {
      refresh_Token: refresh_token,
    });

    res.status(200).json({
      message: "User registered successfully",
      data: {
        user: {
          user: user.name,
          email: user.email,
          id: user._id,
        },
      },
      access_token,
    });
  } catch (error) {
    console.log("Error in the register api -> ", error);
  }
};

const logincontroller = async (req, res) => {
  try {
    const { email, loginpassword } = req.body;
    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isvalidpass = await bcrypt.compare(loginpassword, user.password);

    if (!isvalidpass) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const loginaccesstoken = createaccesstoken({
      userid: user._id,
      role: user.role,
    });

    const loginrefreshtoken = createrefreshtoken({
      userid: user._id,
      role: user.role,
    });

    await usermodel.findOneAndUpdate({ email }, { loginrefreshtoken });

    res.cookie("loginrefreshtoken", loginrefreshtoken, { httpOnly: true });

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: {
          userid: user._id,
          email: user.email,
          name: user.name,
        },
        loginaccesstoken,
      },
    });
  } catch (error) {
    console.log("Error in login api -> ", error);
  }
};

const refreshcontroller = async (req, res) => {
  const decodedrefreshtoken = req.cookies.loginrefreshtoken;

  if (decodedrefreshtoken) {
    return res.status(400).json({
      message: "Refresh token is not available ",
    });
  }

  try {
    const decode = verifyrefresgtoken(decodedrefreshtoken);
  } catch (error) {
    console.log("issue in the refresh api refreshtoken -> ", error);
  }
};

export { regcontroller, logincontroller };
