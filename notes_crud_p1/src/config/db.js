const mongoose = require("mongoose");

const dbconnection = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://benitomussolini857_db_user:benito@benito.fghrxis.mongodb.net/",
    );
  } catch (error) {
    console.log(error);
  }
  console.log("Mongoose connected ");
};

module.exports = dbconnection;
