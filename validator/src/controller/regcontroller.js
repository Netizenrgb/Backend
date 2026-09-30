import usermodel from "../model/uesr.model.js";

export async function registercontroller(req, res) {
  const { email, phone, password } = req.body;

  const user = await usermodel.create({
    email,
    password,
    phone,
  });

  res.status(200).json({
    message: "User registration successful",
    data: {
      email,
      password,
      phone,
      id: user._id,
    },
  });
}
