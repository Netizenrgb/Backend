import mongoose from "mongoose";
import config from "./config.js";

export async function connectdb() {
  await mongoose.connect(config.MONGO_URI);
  console.log("db connected");
}
