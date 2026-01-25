import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Login
    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: "/api/authuser/login",
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["User"],
    }),

    // Register
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: "/api/authuser/register",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    // Logout
    logoutUser: builder.mutation({
      query: () => ({
        url: "/api/authuser/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Get current user
    getCurrentUser: builder.query({
      query: () => "/api/authuser/me",
      providesTags: ["User"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/authuser/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Change password
    changePassword: builder.mutation({
      query: ({ id, password }) => ({
        url: `/api/authuser/${id}`,
        method: "PUT",
        body: { password },
      }),
      invalidatesTags: ["User"],
    }),

    // Update image
    updateProfileImage: builder.mutation({
      query: ({ image }) => ({
        url: "/api/authuser/profile-image",
        method: "PUT",
        body: { image },
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user account
    deleteUserAccount: builder.mutation({
      query: (id) => ({
        url: `/api/authuser/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useDeleteUserAccountMutation,
  useUpdateProfileImageMutation, 
} = authApi;