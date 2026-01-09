import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const aiVerificationApi = createApi({
  reducerPath: "aiVerificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    credentials: "include", // ✅ SEND COOKIES
  }),
  endpoints: (builder) => ({
    createVerification: builder.mutation({
      query: (data) => ({
        url: "/aiverification",
        method: "POST",
        body: data,
      }),
    }),
    getAllVerifications: builder.query({
      query: () => "/aiverification",
    }),
    getVerificationById: builder.query({
      query: (id) => `/aiverification/${id}`,
    }),
    getVerificationByAdId: builder.query({
      query: (adId) => `/aiverification/ad/${adId}`,
    }),
    getVerificationByUserId: builder.query({
      query: (userId) => `/aiverification/user/${userId}`,
    }),
    updateVerification: builder.mutation({
      query: ({ id, data }) => ({
        url: `/aiverification/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteVerification: builder.mutation({
      query: (id) => ({
        url: `/aiverification/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateVerificationMutation,
  useGetAllVerificationsQuery,
  useGetVerificationByIdQuery,
  useGetVerificationByAdIdQuery,
  useGetVerificationByUserIdQuery,
  useUpdateVerificationMutation,
  useDeleteVerificationMutation,
} = aiVerificationApi;
