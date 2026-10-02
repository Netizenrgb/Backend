import { body, validationResult } from "express-validator";

const registervalidator = [
  body("email")
    .exists()
    .trim()
    // .bail() stops running further validation rules for the field when a previous rule fails.
    // Useful for preventing unnecessary checks or errors when an earlier validation already failed.
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email"),

  body("name")
    .exists()
    .withMessage("Name is required").bail()
    .trim()
    .isString()
    .withMessage("Name must be string")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Minimum of 2 and maximum of 50 character are allowed"),
  body("password")
    .exists()
    .withMessage("Password is required").bail()
    .trim()
    .isString()
    .withMessage("Password must be string")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters "),

  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        message: "Invalid request",
        errors: error.array(),
      });
    }
    next();
  },
];

export default registervalidator;
