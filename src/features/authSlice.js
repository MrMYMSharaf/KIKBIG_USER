// features/authSlice.js - Temporary fix to test connection
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    // ✅ Temporarily remove credentials to test basic connection
    credentials: "include", // Comment this out temporarily
  }),
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: "/api/authuser/login",
        method: "POST",
        body: { email, password },
      }),
    }),
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: "/api/authuser/register",
        method: "POST",
        body: newUser,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/api/authuser/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
} = authApi;