import mongoose from "mongoose";

export const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mono_uri);
    console.log("DB connected");
    
  } catch (error) {
    console.log("Error in db connection -> ", error);
  }
};
