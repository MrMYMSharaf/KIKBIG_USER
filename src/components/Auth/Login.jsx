import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Globe, Smartphone } from "lucide-react";
import { useLoginUserMutation } from "../../features/authSlice";
import { useDispatch } from "react-redux";
import { setAuthenticated } from "../../features/redux/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

 

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
      const result = await loginUser({ 
        email, 
        password,
      }).unwrap();
      dispatch(setAuthenticated(true));
      navigate("/");
    } catch (err) {
      // console.error("❌ Login failed:", err);
      setAuthError(err?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = () => {
    // console.log("🔵 Initiating Google OAuth...");
    const oauthUrl = `${import.meta.env.VITE_API_URL}/api/auth/google?country=${selectedCountry}`;
    // console.log("🔵 Redirecting to:", oauthUrl);
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Split Layout Container */}
      <div className="w-full h-screen flex">
        {/* Left Side - Background Image with Frame */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="relative w-full h-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <div className="absolute inset-0 bg-[url('assets/Auth/Login.png')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>

        {/* Right Side - Phone Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-white to-orange-50">
          <style>{`
            /* 3D Phone Frame */
            .phone-frame {
              position: relative;
              width: 100%;
              max-width: 340px;
              padding: 12px;
              background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
              border-radius: 40px;
              box-shadow: 
                0 40px 80px -20px rgba(0, 0, 0, 0.4),
                0 25px 50px -25px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -2px 0 rgba(0, 0, 0, 0.5);
              transform: perspective(1000px) rotateY(-3deg) rotateX(1deg);
              transition: transform 0.3s ease;
            }
            
            .phone-frame:hover {
              transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
            }
            
            .phone-notch {
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              width: 120px;
              height: 24px;
              background: #1a1a1a;
              border-radius: 0 0 16px 16px;
              z-index: 10;
            }
            
            .phone-notch::before {
              content: '';
              position: absolute;
              top: 6px;
              left: 50%;
              transform: translateX(-50%);
              width: 50px;
              height: 5px;
              background: #333;
              border-radius: 3px;
            }
            
            .phone-screen {
              position: relative;
              width: 100%;
              background: white;
              border-radius: 30px;
              overflow: hidden;
              box-shadow: 
                inset 0 0 0 1px rgba(0, 0, 0, 0.1),
                0 8px 30px rgba(0, 0, 0, 0.2);
            }
            
            .phone-buttons {
              position: absolute;
              top: 80px;
              right: -3px;
              width: 3px;
              height: 50px;
              background: linear-gradient(to bottom, #2d2d2d, #1a1a1a);
              border-radius: 2px 0 0 2px;
            }
            
            .phone-button-volume-up {
              position: absolute;
              top: 120px;
              left: -3px;
              width: 3px;
              height: 30px;
              background: linear-gradient(to bottom, #2d2d2d, #1a1a1a);
              border-radius: 0 2px 2px 0;
            }
            
            .phone-button-volume-down {
              position: absolute;
              top: 158px;
              left: -3px;
              width: 3px;
              height: 30px;
              background: linear-gradient(to bottom, #2d2d2d, #1a1a1a);
              border-radius: 0 2px 2px 0;
            }
          `}</style>

          {/* 3D Phone Container */}
          <div className="phone-frame relative z-10">
        {/* Phone Notch */}
        <div className="phone-notch"></div>
        
        {/* Side Buttons */}
        <div className="phone-buttons"></div>
        <div className="phone-button-volume-up"></div>
        <div className="phone-button-volume-down"></div>
        
        {/* Phone Screen with Login Form */}
        <div className="phone-screen">
          <div className="p-5 max-h-[640px] overflow-y-auto custom-scrollbar">
            {/* App Header */}
            <div className="text-center mb-4 pt-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-800 rounded-xl mb-2 shadow-lg">
                <img 
                src="../Logo/kikbig_logo_white.png"
                alt="KiKBiG Logo"
                className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Welcome to KiKBiG</h1>
              <p className="text-xs text-gray-500">Your global classified ad hub</p>
            </div>

            {/* Error Messages */}
            {(error || authError) && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-2.5 py-2 rounded-lg mb-3 text-xs">
                <p className="font-bold text-[10px]">Error</p>
                <p className="text-[10px]">{authError || "Login failed. Please check your credentials."}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-gray-50 text-xs"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-gray-50 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  to="/auth/forgotPasswort"
                  className="text-red-500 text-[10px] font-bold hover:text-red-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-800 text-white p-2.5 rounded-lg font-bold hover:from-blue-800 hover:to-blue-950 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-2 text-gray-400 font-bold">OR</span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-white border-2 border-gray-200 text-gray-700 p-2.5 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all font-bold shadow-sm hover:shadow text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Terms */}
            <div className="mt-3 text-center text-[9px] text-gray-500 leading-tight">
              <p>
                By continuing, you agree to KiKBiG's{" "}
                <Link to="/auth/TermsOfService" className="text-red-500 hover:text-red-600 font-bold">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/auth/PrivacyPolicy" className="text-red-500 hover:text-red-600 font-bold">
                  Privacy Policy
                </Link>
                .{" "}
                <Link to="/auth/NoticeAtCollection" className="text-red-500 hover:text-red-600 font-bold">
                  Notice at collection
                </Link>
                .
              </p>
            </div>

            {/* Register */}
            <div className="mt-3 text-center p-2.5 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
              <p className="text-gray-700 text-xs">
                Not on KiKBiG yet?{" "}
                <Link to="/auth/register" className="text-red-600 hover:text-red-700 font-bold">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Business */}
            <div className="mt-2 text-center">
              <p className="text-gray-600 text-[10px]">
                Are you a business?{" "}
                <a href="#" className="text-red-500 hover:text-red-600 font-bold">
                  Get started here!
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-3 text-center pt-2 border-t border-gray-100">
              <p className="text-gray-400 text-[9px]">
                © 2026 KiKBiG. All rights reserved.
                <br />
                Developed by{" "}
                <a
                  href="https://main.d1itd6l89st8ta.amplifyapp.com/"
                  className="font-bold text-gray-600 hover:text-red-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  1itech
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
};

export default Login;