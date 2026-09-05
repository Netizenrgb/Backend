const mongoose = require("mongoose");

const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mongodb_uri);
    console.log("mongo db connected");
  } catch (error) {
    console.log("Error in db connection -> ", error);
  }
};

module.exports = dbconnection;
