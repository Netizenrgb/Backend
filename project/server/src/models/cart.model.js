import mongoose, { Schema } from "mongoose";

const cartscheme = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        default: 1,
      },

      sizes: {
        type: String,
        enum: ["XS", "S", "M", "L", "XXL"],
      },
    },
  ],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const cartmodel = mongoose.model("carts", cartscheme);
export default cartmodel;
