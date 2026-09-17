import mongoose from "mongoose";
import config from "./config.js";

export async function connectdb() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("db connected");
  } catch (error) {
    console.log("Error in db connection ");
  }
}
