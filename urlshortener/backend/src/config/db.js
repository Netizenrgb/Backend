import mongoose from "mongoose";
import configuri from "./config.js";

export async function dbconnection() {
  try {
    await mongoose.connect(configuri.MONGO_URI);
    console.log("DB connected");
  } catch (error) {
    console.log("Error in data base connection ");
  }
}
