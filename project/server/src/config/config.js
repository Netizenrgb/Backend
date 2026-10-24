import dotenv from "dotenv";
dotenv.config();

const configuris = {
  port: process.env.PORT,
  mongouri: process.env.MONGO_URI,
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN,
  imagekit_private_key: process.env.IMAGEKIT_PRIVATE_KEY,
};

export default configuris;
