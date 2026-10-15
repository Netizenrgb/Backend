import mongoose from "mongoose";

// Mongoose array of objects:
//  [{ property: { type: String, enum: [...], default: "M" } }]

const productscheme = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: [5, "minimum of 5 characters are required"],
    maxlength: [50, "maximum of 5 characters are required"],
  },
  description: {
    type: String,
    required: true,
    minlength: [5, "minimum of 5 characters are required"],
    maxlength: [50, "maximum of 5 characters are required"],
  },
  images: {
    type: [
      {
        type: String,
      },
    ],
    validate: {
      validator: (images) => images.length <= 5,
      message: "Aproduct can only have 5 images",
    },
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["INR", USD],
      default: "INR",
    },
  },

  sizes: [
    {
      size: {
        type: String,
        enum: ["XS", "S", "M", "XL", "XXL", "L"],
        required: true,
      },

      stock: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  ],

  //   this is sellers id , the one who created the prd
  seller: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const productmodel = mongoose.model("product", productscheme);
export default productmodel;
