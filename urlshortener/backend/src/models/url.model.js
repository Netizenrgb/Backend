import mongoose from "mongoose";

const urlschema = mongoose.Schema(
  {
    og_url: {
      type: String,
      required: true,
    },
    short_code: {
      type: String,
      required: true,
    },
    clicks_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const urlmodel = mongoose.model("URL", urlschema);

export default urlmodel;
