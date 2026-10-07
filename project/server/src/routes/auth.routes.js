import express from "express";
import {
  registervalidator,
  loginvalidator,
} from "../validators/auth.validator.js";
import {
  regcontroller,
  logincontroller,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/reg", registervalidator, regcontroller);

router.post("/login", loginvalidator, logincontroller);

export default router;
