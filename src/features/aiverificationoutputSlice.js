import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const aiVerificationApi = createApi({
  reducerPath: "aiVerificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api", // change if needed
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token; // from redux auth slice

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ➤ CREATE
    createVerification: builder.mutation({
      query: (data) => ({
        url: "/aiverification",
        method: "POST",
        body: data,
      }),
    }),

    // ➤ GET ALL
    getAllVerifications: builder.query({
      query: () => "/aiverification",
    }),

    // ➤ GET BY ID
    getVerificationById: builder.query({
      query: (id) => `/aiverification/${id}`,
    }),

    // ➤ GET BY AD ID
    getVerificationByAdId: builder.query({
      query: (adId) => `/aiverification/ad/${adId}`,
    }),

    // ➤ GET BY USER ID
    getVerificationByUserId: builder.query({
      query: (userId) => `/aiverification/user/${userId}`,
    }),

    // ➤ UPDATE
    updateVerification: builder.mutation({
      query: ({ id, data }) => ({
        url: `/aiverification/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // ➤ DELETE
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
