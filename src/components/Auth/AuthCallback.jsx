// File: src/components/Auth/AuthCallback.jsx
// This handles the redirect after Google OAuth authentication

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/redux/authSlice";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("🔵 Fetching user data after OAuth...");
        console.log("🔵 Cookies:", document.cookie);

        const response = await fetch(`${API_URL}/api/authuser/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("🔵 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Error:", errorData);
          throw new Error(errorData.message || "Failed to authenticate");
        }

        const data = await response.json();
        console.log("✅ User data:", data);

        if (data.success && data.user) {
          dispatch(setCredentials({ user: data.user }));
          console.log("✅ Redirecting to home...");
          navigate("/");
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("❌ Auth callback error:", err);
        setError(err.message || "Authentication failed");
        
        setTimeout(() => {
          navigate("/auth/login?error=auth_failed");
        }, 2000);
      }
    };

    fetchUserData();
  }, [dispatch, navigate, API_URL]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        {error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing authentication...</h2>
            <p className="text-gray-600">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;