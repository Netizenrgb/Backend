import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
  },
  passwordhash: {
    type: String,
    required: true,
  },
});

const usermodel = mongoose.model("user", userschema);

export default usermodel;
