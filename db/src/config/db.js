const { default: mongoose } = require("mongoose");

const dbconnection = async () => {
  // mongoose max operation will return promises
  try {
    await mongoose.connect(process.env.mongodb_uri);
  } catch (error) {
    console.log(error);
  }
  console.log("mongoose connected");
};

module.exports = dbconnection;
