import mongoose from "mongoose";
import configuris from "../config/config.js";

export async function dbconnection() {
  await mongoose.connect(configuris.mongouri);
  console.log("DB connected");
  
}
