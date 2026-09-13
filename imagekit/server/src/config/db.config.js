import mongoose from "mongoose";

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log("db connected ");
  } catch (error) {
    console.log("Error in the db connection -> ", error);
  }
};

export default connectdb;
