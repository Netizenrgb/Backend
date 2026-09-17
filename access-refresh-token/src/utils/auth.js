import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import router from "../routes/auth.routes.js";

export const generatetokens = ({ userid }) => {
  const accesstoken = jwt.sign({ id: userid }, config.ACCESS_TOKEN, {
    // this token will expire with in 15 mins
    expiresIn: "15m",
  });

  const refreshtoken = jwt.sign({ id: userid }, config.REFRESH_TOKEN, {
    // this token will expire with in 7 days
    expiresIn: "7d",
  });

  //   // IMPORTANT: The comma operator returns only the last value.
  // So `return (a, b)` returns `b`, NOT both values.
  // Use an object/array when you need to return multiple values:
  // `return { a, b }`
  return { accesstoken, refreshtoken };
};

export function verifyaccesstoken(token) {
  const decodetoken = jwt.verify(token, config.ACCESS_TOKEN);
  return decodetoken;

  // if any error occur while execution of this function then its handled at where the function is being called
}

export function verifyrefreshtoken(token) {
  const decode = jwt.verify(token, config.REFRESH_TOKEN);
  return decode;
}
