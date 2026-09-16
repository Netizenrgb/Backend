import dotenv from "dotenv";

dotenv.config();

const config = {
  MONGO_URI: process.env.mongo_uri,
  REFRESH_TOKEN: process.env.refresh_token_secret,
  ACCESS_TOKEN: process.env.access_token_secret,
};

export default config;
