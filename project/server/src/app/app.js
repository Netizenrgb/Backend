import express from "express";
import { dbconnection } from "../config/db.js";
import router from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import productrouter from "../routes/products.routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/products", productrouter);

await dbconnection();

export default app;
