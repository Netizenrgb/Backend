import dotenv from "dotenv";

dotenv.config();

const envconfig = {
  mongouri: process.env.MONGO_URI,
};

export default envconfig;
