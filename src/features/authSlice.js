import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include", // ✅ REQUIRED for cookies
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

    getCurrentUser: builder.query({
      query: () => "/api/authuser/me",
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useGetCurrentUserQuery,
} = authApi;
