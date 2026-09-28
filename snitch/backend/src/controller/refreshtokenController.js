import UserModel from "../model/user.js";
import { refreshtokenverification, generatetokens } from "../utils/auth.js";

export const refreshController = async (req, res) => {
  try {
    console.log("response api hit");

    const refreshtoken = req.cookies.refreshtoken;

    if (!refreshtoken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }
    const decoded = refreshtokenverification(refreshtoken);

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    if (user.refresh_token !== refreshtoken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const { accesstoken } = generatetokens({
      userid: user._id,
    });

    return res.status(200).json({
      user: { user: user.name, email: user.email },
      accesstoken,
    });
  } catch (error) {
    console.log("Error in refresh token api -> ", error);

    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};
