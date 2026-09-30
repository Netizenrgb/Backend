import mongoose from "mongoose";
import envconfig from "./config.js";

async function dbconnection() {
  try {
    await mongoose.connect(envconfig.mongouri);
    console.log("db connected");
  } catch (error) {
    console.log("Error in the db connection -> ", error);
  }
}

export default dbconnection;
