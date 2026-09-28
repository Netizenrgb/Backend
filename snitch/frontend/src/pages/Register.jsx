import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpass: "",
  });
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/reg", formData);

      setMessage(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmpass: "",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-zinc-900 p-8"
      >
        <h1 className="mb-6 text-3xl font-bold">Create Account</h1>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-zinc-300">Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-zinc-300">Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-zinc-300">Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="mb-2 block text-sm text-zinc-300">
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmpass"
            value={formData.confirmpass}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="w-full rounded-lg bg-zinc-800 px-4 py-3 outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Success */}
        {message && (
          <p className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
