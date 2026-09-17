import express from "express";
const app = express();
import authroutes from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";

console.log("app is working ");


app.get("/apphaibc", (req, res) => {

  res.send("yopooyoyo");
});

app.use(express.json());
app.use(cookieParser());
app.use("/app/auth", authroutes);

export default app;
