import dotenv from "dotenv";
dotenv.config();

const configuri = {
  port: process.env.PORT,
  mongouri: process.env.mongouri,
  node_env: process.env.NODE_ENV,
  accesstoken: process.env.ACCESS_TOKEN_SECRET,
  refreshtoken: process.env.REFRESH_TOKEN_SECRET,
};

export default configuri;
