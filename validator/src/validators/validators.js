// express-validator provides different validation methods.
// We can import only what we need, such as body, param, or query,
// depending on where the data we want to validate is located.
// body() → validates req.body
// param() → validates req.params
// query() → validates req.query
import { body, validationResult } from "express-validator";

const registervalidator = [
  body("email")
    .exists()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Invalid Email address"),

  body("phone")
    .exists()
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid number "),

  body("password")
    .exists()
    .withMessage("Password is required")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Minimum of 6 characters are required "),

  (req, res, next) => {
    /* 
    validationResult(req) means:
    "express-validator, give all the validation errors collected from this request."
    */
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        message: "Invalid Request",
        error: error.array(),
      });
    }
    next();
  },
];

export default registervalidator;
