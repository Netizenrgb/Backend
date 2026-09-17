import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // this is a custom error
    minlength: [3,"Minimum of 3 characters are required"],
    maxlength:  [20,"Maximum of 3 characters are required"],
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passwordhash: {
    type: String,
    required: true,
  },
  refreshtoken: {
    type: String,
  },
});

const usermodel = mongoose.model("user", userschema);

export default usermodel;
