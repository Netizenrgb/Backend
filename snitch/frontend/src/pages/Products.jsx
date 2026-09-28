import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { logout, user } = useAuth();

  const navigate = useNavigate();

  const getProducts = async () => {
    try {
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products);
    } catch (error) {
      console.error("Get products error:", error);

      setError("Failed to fetch products");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId) {
        const response = await api.put(`/products/${editingId}`, productData);

        const updatedProduct = response.data.product;

        setProducts((previousProducts) =>
          previousProducts.map((product) =>
            product._id === editingId ? updatedProduct : product,
          ),
        );

        setSuccess("Product updated successfully");

        setEditingId(null);
        setForm(emptyForm);

        return;
      }

      const response = await api.post("/products", productData);

      const newProduct = response.data.product;

      setProducts((previousProducts) => [...previousProducts, newProduct]);

      setSuccess("Product added successfully");

      setForm(emptyForm);
    } catch (error) {
      console.error("Product save error:", error);

      setError(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });

    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);

    setError("");
    setSuccess("");
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/products/${productId}`);

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product._id !== productId),
      );

      setSuccess("Product deleted successfully");

      if (editingId === productId) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      console.error("Delete product error:", error);

      setError(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleLogout = async () => {
    await logout();

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* NAVBAR */}

      <nav className="flex items-center justify-between border-b border-zinc-800 px-8 py-4">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-zinc-400">{user.name}</span>}

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {error && <p className="px-8 pt-6 text-red-500">{error}</p>}

      {success && <p className="px-8 pt-6 text-green-500">{success}</p>}

      <section className="mx-auto max-w-2xl px-8 pt-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-6 text-xl font-semibold">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-400"
                placeholder="Product name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-400"
                placeholder="Product description"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">Price</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-400"
                placeholder="Product price"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-zinc-400">Stock</label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 outline-none focus:border-zinc-400"
                placeholder="Stock quantity"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-white px-5 py-2 font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-zinc-700 px-5 py-2 font-medium transition hover:bg-zinc-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <main className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <h2 className="mb-2 text-xl font-semibold">{product.name}</h2>

            <p className="mb-4 text-zinc-400">{product.description}</p>

            <div className="mb-4 space-y-1">
              <p className="font-bold">₹{product.price}</p>

              <p className="text-sm text-zinc-500">Stock: {product.stock}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(product)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(product._id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Products;
