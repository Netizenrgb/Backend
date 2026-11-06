import { Router } from "express";
import addtocartvalidator from "../validators/cart.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { addtocart, getcart } from "../controller/cart.controller.js";
const cartrouter = Router();

cartrouter.post("/", authenticate, addtocartvalidator, addtocart);

cartrouter.get("/", authenticate, getcart);

export default cartrouter;
