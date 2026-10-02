import jwt from "jsonwebtoken";
import configuris from "../config/config.js";

export function createaccesstoken({ userid, role }) {
  const accesstoken = jwt.sign({ userid, role }, configuris.access_token, {
    expiresIn: "15m",
  });

  return accesstoken;
}

export function createrefreshtoken({ userid, role }) {
  const refreshtoken = jwt.sign({ userid, role }, configuris.refresh_token, {
    expiresIn: "7d",
  });

  return refreshtoken;
}
