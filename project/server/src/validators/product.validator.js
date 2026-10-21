import { body, validationResult } from "express-validator";

export const productvalidator = [
  body("title")
    .exists()
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Title must be between 5 and 50 characters"),

  body("description")
    .exists()
    .withMessage("Description is required")
    .bail()
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Description must be between 5 and 50 characters"),

  body("price.amount")
    .exists()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price amount must be a number greater than or equal to 0"),

  body("price.currency")
    .exists()
    .withMessage("Currency is required")
    .bail()
    .isString()
    .withMessage("Currency must be a string")
    .bail()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),

  body("sizes")
    .exists()
    .withMessage("Sizes are required")
    .bail()
    .isArray()
    .withMessage("Sizes must be an array"),

  body("sizes.*.size")
    .exists()
    .withMessage("Size must be present in every sizes entry")
    .bail()
    .isString()
    .withMessage("Size must be a string")
    .bail()
    .trim()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be XS, S, M, L, XL, or XXL"),

  body("sizes.*.stock")
    .exists()
    .withMessage("Stock must be present in every sizes entry")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid request",
        errors: errors.array(),
      });
    }

    next();
  },
];
