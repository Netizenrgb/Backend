import { body } from "express-validator";
import cartmodel from "../models/cart.model.js";

const addtocartvalidator = [
    body()
]