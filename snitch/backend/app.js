import express from "express";
import { dbconnection } from "./src/config/db.js";
import router from "./src/routes/users.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "./src/routes/product.routes.js";
import cors from "cors";

await dbconnection();

const app = express();

app.use(
  cors({
    origin: "https://snitch-frontend-twly.onrender.com",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/products", productRoutes);

export default app;
