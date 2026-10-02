import express from "express";
import registervalidator from "../validators/auth.validator.js";
import regcontroller from "../controller/auth.controller.js";

const router = express.Router();

router.post("/reg", registervalidator, regcontroller);

export default router;
