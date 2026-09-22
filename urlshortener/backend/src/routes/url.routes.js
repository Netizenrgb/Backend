import express from "express";
import generatecode from "../utils/generate.code.js";
import urlmodel from "../models/url.model.js";

const router = express.Router();

/* 
post /api/url/
*/
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    if (
      url.startsWith("http://") === false &&
      url.startsWith("https://") === false
    ) {
      return res.status(400).json({
        error: "Pls enter a valid URL",
      });
    }

    if (url.length > 2048) {
      return res.status(400).json({
        error: "URL is to looonnnggg",
      });
    }

    const code = generatecode();
    const new_url = await urlmodel.create({
      og_url: url,
      short_code: code,
    });

    res.status(200).json({
      message: "URL shorten successfully",
      data: {
        originalurl: new_url.og_url,
        shortcode: new_url.shortcode,
      },
    });
  } catch (error) {
    console.log("Error in the post api -> ", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

/* 
get /api/url/getAllLink
*/

router.get("/getlinks", async function (req, res) {
  try {
    const urls = await urlmodel.find();

    return res.status(200).json({
      message: "URLs fetched successfully",
      data: {
        urls,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
    console.log("Error in the get api -> ", error);
  }
});

export default router;
