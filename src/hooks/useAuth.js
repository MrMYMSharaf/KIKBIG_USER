// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserId } from '../features/redux/adPostSlice';

/**
 * Custom hook to sync auth data with ad post slice
 * Uses existing Redux auth state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Get auth data from existing auth slice
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // ✅ Use user.id directly from the user object
      const userId = user.id || user._id;

      if (userId) {
        console.log("✅ useAuth: Setting userId in adPost slice:", userId);
        dispatch(setUserId(userId));
      } else {
        console.error("❌ useAuth: No userId found in user object:", user);
      }
    }
  }, [isAuthenticated, user, dispatch]);

  return {
    userId: user?.id || user?._id,
    user,
    token,
    isAuthenticated,
    isLoading: false,
  };
};