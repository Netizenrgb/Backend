import productmodel from "../models/product.model.js";

export async function createproduct(req, res) {
  console.log(req.body);
  res.status(200).json({
    message: "User is done ",
  });
}
