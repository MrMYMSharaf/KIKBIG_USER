import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLoginUserMutation } from "../../features/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
    try {
      const result = await loginUser({ email, password }).unwrap();
      console.log("✅ Login success:", result);

      // Example: save token in localStorage
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };

  return (
    <div className="bg-[url('assets/Auth/Login.png')] bg-cover bg-center h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full bg-opacity-75">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to KiKBiG</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </span>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              to="/forgotPassword"
              className="text-red-500 text-sm hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-2">
              Login failed. Please check your credentials.
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        {/* Social login */}
        <div className="space-y-4">
          <button className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-blue-600 transition duration-300">
            <i className="fab fa-facebook mr-2"></i> Continue with Facebook
          </button>
          <button className="w-full bg-white border border-gray-300 text-gray-600 p-3 rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-300">
            <i className="fab fa-google mr-2"></i> Continue with Google
          </button>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to KiKBiGlk's{" "}
            <Link to="/TermsOfService" className="text-red-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and acknowledge you've read our{" "}
            <Link to="/PrivacyPolicy" className="text-red-500 hover:underline">
              Privacy Policy
            </Link>
            .{" "}
            <Link to="/NoticeAtCollection" className="text-red-500 hover:underline">
              Notice at collection
            </Link>
            .
          </p>
        </div>

        {/* Register */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Not on KiKBiGlk yet?{" "}
            <Link to="/auth/register" className="text-red-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Business */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Are you a business?{" "}
            <a href="#" className="text-red-500 hover:underline">
              Get started here!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
