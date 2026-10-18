import { body } from "express-validator";

export const productvalidator = [
  body("title")
    .exists()
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be string")
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("comply with the constrains of the tilte "),
  body("description")
    .exists()
    .withmessage("Description is required")
    .bail()
    .isString()
    .withMessage("Description must be string")
    .bail()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage("Length od description must be b/w 5-50")
    .bail(),
  body("price.amount")
    .exists()
    .withMessage("Price amount is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("price amount must be a floating number and must be greater than 0"),
    body("price.currency").exists().withMessage("currency is required").isString().withMessage("Currency must be a string values").bail().isIn("INR","USD").withMessage("Only INR & USD is allowed")
];
