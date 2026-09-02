const mongoose = require("mongoose");

const dbconnection = async () => {
  try {
    await mongoose.connect(process.env.mongo_uri);
  } catch (error) {
    console.log(error);
  }
  console.log("Mongoose connected ");
};

module.exports = dbconnection;
