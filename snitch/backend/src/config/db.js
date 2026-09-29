import mongoose from "mongoose";
import configuri from "./config.js";

export async function dbconnection() {
  try {
    await mongoose.connect(configuri.mongouri);
    console.log("DB connected");
  } catch (error) {
    console.log("Error in db connection -> ", error);
    process.exit(1);
  }
}
