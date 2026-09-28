import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} from "../validator/product.validator.js";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

const router = express.Router();

router.post("/", authenticate, createProductValidator, validate, createProduct);

router.get("/", getProducts);

router.get("/:id", productIdValidator, validate, getProduct);

router.put(
  "/:id",
  authenticate,
  productIdValidator,
  updateProductValidator,
  validate,
  updateProduct,
);

router.delete(
  "/:id",
  authenticate,
  productIdValidator,
  validate,
  deleteProduct,
);

export default router;
