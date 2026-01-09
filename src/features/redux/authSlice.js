// features/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../authSlice";

const initialState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload === true;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.loginUser.matchFulfilled,
        (state) => {
          state.isAuthenticated = true;
        }
      )
      .addMatcher(
        authApi.endpoints.logoutUser.matchFulfilled,
        (state) => {
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        authApi.endpoints.logoutUser.matchRejected,
        (state) => {
          state.isAuthenticated = false;
        }
      );
  },
});

export const { logout, setAuthenticated, clearAuth } = authSlice.actions;
export default authSlice.reducer;
