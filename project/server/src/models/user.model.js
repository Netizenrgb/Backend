import mongoose from "mongoose";

const userscheme = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "seller"],
  },
});

const usermodel = mongoose.model("prj_user", userscheme);

export default usermodel;
