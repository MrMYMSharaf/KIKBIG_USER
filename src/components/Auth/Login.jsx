import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLoginUserMutation } from "../../features/authSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/redux/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // ✅ Check for OAuth errors
  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "auth_failed") {
      setAuthError("Google authentication failed. Please try again.");
    } else if (errorParam === "server_error") {
      setAuthError("Server error occurred. Please try again later.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const result = await loginUser({ email, password }).unwrap();
      console.log("✅ Login success:", result);

      dispatch(setCredentials({ 
        user: result.user
      }));

      navigate("/");
    } catch (err) {
      console.error("❌ Login failed:", err);
      setAuthError(err?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  // ✅ Handle Google Login - FIXED
  const handleGoogleLogin = () => {
    console.log("🔵 Initiating Google OAuth...");
    console.log("🔵 Redirecting to:", `${import.meta.env.VITE_API_URL}/api/auth/google`);
    
    // ✅ Direct redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="bg-[url('assets/Auth/Login.png')] bg-cover bg-center h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full bg-opacity-75">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to KiKBiG</h1>

        {/* Show error messages */}
        {(error || authError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {authError || "Login failed. Please check your credentials."}
          </div>
        )}

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
              to="/auth/forgotPasswort"
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
          <button 
            type="button"
            className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-blue-600 transition duration-300"
          >
            <i className="fab fa-facebook mr-2"></i> Continue with Facebook
          </button>
          
          {/* ✅ Google OAuth Button - FIXED */}
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white border border-gray-300 text-gray-600 p-3 rounded-lg flex items-center justify-center hover:bg-gray-100 transition duration-300"
          >
            <i className="fab fa-google mr-2 text-red-500"></i> Continue with Google
          </button>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to KiKBiG's{" "}
            <Link to="/auth/TermsOfService" className="text-red-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and acknowledge you've read our{" "}
            <Link to="/auth/PrivacyPolicy" className="text-red-500 hover:underline">
              Privacy Policy
            </Link>
            .{" "}
            <Link to="/auth/NoticeAtCollection" className="text-red-500 hover:underline">
              Notice at collection
            </Link>
            .
          </p>
        </div>

        {/* Register */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Not on KiKBiG yet?{" "}
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
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs">
            © 2024 KiKBiG. All rights reserved. and developed by <a href="https://main.d1itd6l89st8ta.amplifyapp.com/" className="font-bold">1itech.</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;