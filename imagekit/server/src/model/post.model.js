import mongoose from "mongoose";

const postschema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    image: { type: String, required: true },
  },
  //   timestamps craete a timestap in the db whenever its updated
  { timestamps: true },
);

// mongoose.model("Modelname", Schema);
const postmodel = mongoose.model("posts", postschema);

export default postmodel;
