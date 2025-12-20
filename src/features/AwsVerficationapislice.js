// AwsVerificationApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const awsVerificationApi = createApi({
  reducerPath: "awsVerificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://7iv8uj40jg.execute-api.us-east-1.amazonaws.com/dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    verifyItem: builder.mutation({
      query: (payload) => ({
        url: "verification",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useVerifyItemMutation } = awsVerificationApi;
