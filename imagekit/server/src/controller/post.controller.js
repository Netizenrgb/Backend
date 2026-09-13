import postmodel from "../model/post.model.js";
import sendfiles from "../services/storage.service.js";

const createpost = async (req, res) => {
  const { caption } = req.body;
  const file = req.file;

  if (!caption || !file) {
    return res
      .status(400)
      .json({ success: false, message: "Fields are required" });
  }

  const imageupload = await sendfiles(file.buffer, file.originalname);

  const post = await postmodel.create({
    caption,
    image: imageupload.url,
  });
  return res.status(200).json({
    success: true,
    message: "post created ",
  });
};

export default createpost;
