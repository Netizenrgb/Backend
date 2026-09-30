import express from "express";
import { registercontroller } from "../controller/regcontroller.js";
import registervalidator from "../validators/validators.js";

const router = express.Router();

router.post("/reg", registervalidator, registercontroller);

export default router;
