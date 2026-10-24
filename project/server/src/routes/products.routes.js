import { json, Router } from "express";
import { productvalidator } from "../validators/product.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createproduct,
  listallproducts,
} from "../controller/product.controller.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 4, //only 4 files are allowed at a time
    fileSize: 10 * 1024 * 1024, // 1MB
  },
});

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "User is not authorised to create products",
      });
    }

    next();
  },
  upload.array("images"),
  // Multer parses multipart/form-data fields as strings.
  // Parse the JSON-encoded `price` string into an object and `sizes` string into an array
  // so the validator and controller receive the expected data types.
  // Return 400 if either field contains invalid JSON; otherwise, pass control to the next middleware.data type
  (req, res, next) => {
    try {
      req.body.price = JSON.parse(req.body.price);
      req.body.sizes = JSON.parse(req.body.sizes);

      next();
    } catch (error) {
      return res.status(400).json({
        message: "Invalid JSON in price or sizes",
      });
    }
  },
  productvalidator,
  createproduct,
);

router.get("/", authenticate, listallproducts);

export default router;
