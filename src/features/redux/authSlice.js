// features/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../authSlice";

const initialState = {
  user: null,
  isAuthenticated: false,
  // ❌ NO TOKEN in Redux state (it's in HttpOnly cookie)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    // ✅ Optional: Update user data without logging out
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.loginUser.matchFulfilled,
        (state, action) => {
          const { user } = action.payload;
          state.user = user;
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        authApi.endpoints.logoutUser.matchFulfilled,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
        }
      )
      // ✅ Handle logout errors (still clear state)
      .addMatcher(
        authApi.endpoints.logoutUser.matchRejected,
        (state) => {
          state.user = null;
          state.isAuthenticated = false;
        }
      );
  },
});

export const { logout, setCredentials, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;