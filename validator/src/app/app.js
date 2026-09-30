import express from "express";
import dbconnection from "../config/db.js";
import router from "../routes/auth.rout.js";

const app = express();
app.use(express.json());
await dbconnection();

app.use("/api/auth", router);

export default app;
