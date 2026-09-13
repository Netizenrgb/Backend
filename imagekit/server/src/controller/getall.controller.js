import postmodel from "../model/post.model.js";

const getallpost = async (req, res) => {
  const getallpost = await postmodel.find();

  return res.status(200).json({
    message: "Post fetched",
    success: true,
    // data: getallpost.image,
    data: getallpost.map((val) => ({
      image: val.image,
    })),
  });
};

export default getallpost;
