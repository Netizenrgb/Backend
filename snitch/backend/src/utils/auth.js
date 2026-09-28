import jwt from "jsonwebtoken";
import configuri from "../config/config.js";

// token generation
export const generatetokens = ({ userid }) => {
  const accesstoken = jwt.sign({ id: userid }, configuri.accesstoken, {
    expiresIn: "15m",
  });

  const refreshtoken = jwt.sign({ id: userid }, configuri.refreshtoken, {
    expiresIn: "7d",
  });

  return { accesstoken, refreshtoken };
};

// accesstoken verification
export function accesstokenverification(token) {
  const decodeaccesstoken = jwt.verify(token, configuri.accesstoken);

  return decodeaccesstoken;
}

// refreshtoken verification
export function refreshtokenverification(token) {
  const decoderefreshtoken = jwt.verify(token, configuri.refreshtoken);

  return decoderefreshtoken;
}
