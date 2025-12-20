import Cookies from "js-cookie";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserId } from '../features/redux/adPostSlice';

/**
 * Custom hook to sync auth data + cookie token
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // ✅ Read token from cookies
  const token = Cookies.get("token");

  // Determine final auth state:
  const isUserLoggedIn = Boolean(token || isAuthenticated);

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (isUserLoggedIn && userId) {
      console.log("🔵 useAuth: Syncing userId to adPost:", userId);
      dispatch(setUserId(userId));
    }
  }, [isUserLoggedIn, userId, dispatch]);

  return {
    userId,
    user,
    isAuthenticated: isUserLoggedIn, // override with cookie-based check
    token,
  };
};