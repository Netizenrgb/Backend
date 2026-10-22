import { Router } from "express";
import { productvalidator } from "../validators/product.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { createproduct } from "../controller/product.controller.js";

const router = Router();

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
  createproduct,
);

export default router;
