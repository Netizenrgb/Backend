import express from "express";
import { dbconnection } from "../config/db.js";
import router from "../routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", router);

await dbconnection();

export default app;
