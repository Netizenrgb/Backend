import dotenv from "dotenv";
dotenv.config();

const configuri = {
  MONGO_URI: process.env.mongouri,
};

export default configuri;
