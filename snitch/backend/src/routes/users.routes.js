import express from "express";
import regController from "../controller/authController.js";
import { registerValidator } from "../validator/auth.validator.js";
import { loginValidator } from "../validator/loginValidator.js";
import { validate } from "../middleware/validation.middleware.js";
import { logincontroller } from "../controller/loginController.js";
import meController from "../controller/meController.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { refreshController } from "../controller/refreshtokenController.js";
import logoutController from "../controller/logoutController.js";

const router = express.Router();

router.post("/reg", registerValidator, validate, regController);

router.post("/login", loginValidator, validate, logincontroller);

router.get("/me", authenticate, meController);

router.post("/refresh-token", refreshController);

router.post("/logout", authenticate, logoutController);

export default router;
