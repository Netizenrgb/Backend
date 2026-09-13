import express from "express";
import router from "./routes/post.route.js";

const app = express();

app.use(express.json());
app.use("/user", router);

export default app;
