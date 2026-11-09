import { body, validationResult } from "express-validator";

const addtocartvalidator = [
  body("productid")
    .exists()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("quantity")
    .exists()
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("size")
    .exists()
    .bail()
    .isString()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Invalid size"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed in cart",
        errors: errors.array(),
      });
    }
    next();
  },
];

export default addtocartvalidator;
