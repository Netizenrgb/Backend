import UserModel from "../model/user.js";

const meController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error in me api -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default meController;
