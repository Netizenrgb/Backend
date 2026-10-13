import express from "express";
import {
  registervalidator,
  loginvalidator,
} from "../validators/auth.validator.js";
import {
  regcontroller,
  logincontroller,
  refreshcontroller,
  getmecontroller,
} from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/reg", registervalidator, regcontroller);

router.post("/login", loginvalidator, logincontroller);

router.post("/refresh", refreshcontroller);

router.get("/me", authenticate, getmecontroller);

export default router;
