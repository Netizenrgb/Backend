import cartmodel from "../models/cart.model.js";
import productmodel from "../models/product.model.js";

export async function addtocart(req, res) {
  const { productid, quantity, sizes } = req.body;
  const product = await productmodel.findById(productid);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const prdsize = product.sizes.find((s) => s.sizes === size);

  if (!prdsize) {
    return res.status(400).json({
      message: "Size is not available",
    });
  }

  if (prdsize.stock < quantity) {
    return res.status(400).json({
      message: "Insufficient stock",
    });
  }

  // let cart = await cartmodel.findOne({ user: req.user.userid });

  // if (!cart) {
  //   cart = await cartmodel.findOne({ user: req.user.userid });
  // }

  const cart =
    (await cartmodel.findOne({ user: req.user.userid })) ??
    (await cartmodel.create({ user: req.user.userid }));

  const productincart = cart.products.find(
    (p) => p.product.toString() === productid && p.sizes === prdsize,
  );

  if (productincart) {
    if (productincart.quantity + quantity > prdsize.stock) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    await cartmodel.updateOne(
      {
        user: req.user.userid,
        "products.product": productid,
        "products.sizes": size,
      },

      {
        $inc: {
          "products.$.quantity": quantity,
        },
      },
    );
    return res.status(200).json({
      message: "Product quantity updated in cart",
    });
  }

  await cartmodel.findOneAndUpdate(
    {
      user: req.user.userid,
    },

    {
      $push: {
        products: {
          product: productid,
          quantity: quantity,
          sizes: sizes,
        },
      },
    },
  );

  return res.status(200).json({
    message: "Product added to cart",
  });
}

export async function getcart(req, res) {
  const cart =
    (await cartmodel.findOne({ user: req.user.userid })) ??
    (await cartmodel.create({ user: req.user.userid }));

    return res.status(200).json({
      message:"cart retrived successfully", 
      data:{
        cart:cart
      }
    })

}
