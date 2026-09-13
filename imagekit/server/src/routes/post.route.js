import express from "express";
import { upload } from "../config/multer.config.js";
import createpost from "../controller/post.controller.js";
import getallpost from "../controller/getall.controller.js";

const router = express.Router();

router.post("/create", upload.single("image"), createpost);

router.get("/getallimages", getallpost);

export default router;
