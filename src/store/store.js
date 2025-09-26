// store.js
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/authSlice";
import { languageApi } from "../features/languageSlice";
import { categoryApi } from "../features/categorySlice";
import { locationApi } from "../features/locationSlice";
import authReducer from "../features/redux/authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [languageApi.reducerPath]: languageApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(languageApi.middleware)
      .concat(categoryApi.middleware)
      .concat(locationApi.middleware),
});