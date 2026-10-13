import { readaccesstoken } from "../utils/auth.utils.js";

export function authenticate(req, res, next) {
  const accesstoken = req.headers.authorization?.split(" ")[1];

  if (!accesstoken) {
    return res.status(400).json({
      message: "Accesstoken not found in the request header",
    });
  }

  try {
    const decode = readaccesstoken(accesstoken);
    req.user = decode;

    next();
  } catch (error) {
    res.status(401).json({
      message: "invalid  accesstoken",
    });
  }
}
