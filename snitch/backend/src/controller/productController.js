import ProductModel from "../model/product.js";

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    const product = await ProductModel.create({
      name,
      description,
      price,
      stock,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log("Create product error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("Get products error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET SINGLE PRODUCT
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log("Get product error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.log("Delete product error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        stock,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log("Update product error -> ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProduct, getProducts, getProduct, deleteProduct, updateProduct };
