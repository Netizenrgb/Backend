const { default: mongoose } = require("mongoose");

const dbconnection = async () => {
  // mongoose max operation will return promises
  try {
    await mongoose.connect(
      "mongodb+srv://benitomussolini857_db_user:benito@benito.fghrxis.mongodb.net/",
    );
  } catch (error) {
    console.log(error);
  }
  console.log("mongoose db connected");
};

module.exports=dbconnection