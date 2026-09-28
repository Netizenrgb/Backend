import UserModel from "../model/user.js";

const logoutController = async (req, res) => {
  try {
    // Invalidate the refresh token stored in DB
    await UserModel.findByIdAndUpdate(req.user.id, {
      $set: {
        refresh_token: null,
      },
    });

    // Remove refresh-token cookie from client
    res.clearCookie("refreshtoken");

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Logout error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default logoutController;
