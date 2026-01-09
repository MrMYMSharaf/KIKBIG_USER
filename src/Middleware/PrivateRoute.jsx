import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  // ✅ Redux persist will automatically restore isAuthenticated
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  // ✅ Also check cookie as backup
  const token = Cookies.get("token");
  
  // User is logged in if EITHER Redux state OR cookie exists
  const isLoggedIn = isAuthenticated || Boolean(token);
  
  // console.log("🔵 PrivateRoute check:", { 
  //   isAuthenticated, 
  //   hasToken: Boolean(token), 
  //   isLoggedIn 
  // });
  
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;