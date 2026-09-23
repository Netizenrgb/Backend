import express from "express";
import router from "../routes/url.routes.js";
import urlmodel from "../models/url.model.js";

const app = express();
app.use(express.json());
app.use("/api/url", router);

/* 
this api is created on app because the the base url that we want is url/code not the /api/url, we need to have the shortcode to be appended to the link  
*/

app.get("/:code", async function (req, res) {
  try {
    const { code } = req.params;
    const url = await urlmodel.findOne({ short_code: code });

    if (!url) {
      return res.status(404).json({
        message: "URL not found",
      });
    }

    res.redirect(302, url.og_url);

    await urlmodel.findOneAndUpdate(
      {
        // Find the document whose short_code is code
        short_code: code,
      },
      {
        // inc is for both incrementing & decrementing the values
        // for dec use [$inc: { clicks_count: -1 },]
        $inc: { clicks_count: 1 },
      },
    );
  } catch (error) {
    console.log("Error in redirect api -> ", error);

    res.status(500).json({
      message: "Invalid url code ",
    });
  }
});

export default app;
