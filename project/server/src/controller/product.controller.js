import productmodel from "../models/product.model.js";
import { fileupload } from "../services/storage.service.js";

export async function createproduct(req, res) {
  console.log(req.body);
  // to access the file use req.files
  console.log(req.files);

  const fileurls = [];
  for (let i = 0; i < req.files.length; i++) {
    const response = await fileupload({
      buffer: req.files[i].buffer,
      filename: req.files[i].originalname,
    });
    fileurls.push(response.url);
  }

  const product = await productmodel.create({
    title: req.body.title,
    description: req.body.description,
    price: {
      amount: req.body.price.amount,
      currency: req.body.price.currency,
    },
    sizes: req.body.sizes,
    images: fileurls,
    seller: req.user.userid,
  });

  res.status(200).json({
    message: "product created successfully",
    data: {
      product,
    },
  });
}
