import express from "express";
import { dbconnection } from "./src/config/db.js";
import router from "./src/routes/users.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "./src/routes/product.routes.js";

await dbconnection();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/products", productRoutes);

export default app;
