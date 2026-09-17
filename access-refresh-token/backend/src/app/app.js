import express from "express";
const app = express();
import authroutes from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser());
app.use("/app/auth", authroutes);

app.get("/apphaibc", (req, res) => {
  res.send("yopooyoyo");
});

export default app;
