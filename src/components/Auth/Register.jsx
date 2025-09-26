import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useRegisterUserMutation } from "../../features/authSlice"; // adjust path if needed

const Register = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState(null);


  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await registerUser(form).unwrap();
      console.log("✅ Registered:", result);
      navigate("/auth"); // redirect to login
    } catch (err) {
      console.error("❌ Registration failed:", err);
      setError(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-[url('assets/Auth/Login.png')] bg-cover bg-center h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full bg-opacity-75">
        <h1 className="text-xl font-semibold text-center mb-4">Join pedlarlk</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
            required
          />

          {/* Phone */}
          <input
            type="number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </span>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white p-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition duration-300 disabled:bg-gray-400"
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-2">
          <button className="w-full bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center text-sm hover:bg-blue-600 transition duration-300">
            <i className="fab fa-facebook mr-1"></i> Sign up with Facebook
          </button>
          <button className="w-full bg-white border border-gray-300 text-gray-600 p-2 rounded-lg flex items-center justify-center text-sm hover:bg-gray-100 transition duration-300">
            <i className="fab fa-google mr-1"></i> Sign up with Google
          </button>
        </div>

        {/* Terms */}
        <div className="mt-4 text-center text-xs text-gray-600">
          <p>
            By continuing, you agree to pedlarlk's{" "}
            <a href="#" className="text-red-500 hover:underline">
              Terms of Service
            </a>{" "}
            and acknowledge you've read our{" "}
            <a href="#" className="text-red-500 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>

        {/* Already registered */}
        <div className="mt-3 text-center text-xs">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/auth" className="text-red-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
