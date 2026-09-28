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
    origin: [
      "https://snitch-frontend-twly.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/products", productRoutes);

export default app;
