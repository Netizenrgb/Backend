import { body, validationResult } from "express-validator";

const addtocartvalidator = [   
  body("porductid")
    .exists()
    .withMessage("Product Id is required")
    .isString()
    .withMessage("Porduct must be a string")
    .bail()
    .isMongoId()
    .withMessage("Product id must be a valid mongo id"),
  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer and greater than 0"),
  body("size")
    .exists()
    .withMessage("Size is required")
    .bail()
    .isString()
    .withMessage("Size must be a string")
    .bail()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"])
    .withMessage("Size must be of XS S M XL XXL L"),

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
