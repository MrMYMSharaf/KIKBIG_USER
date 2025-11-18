import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/payment", // backend route
  }),
  endpoints: (builder) => ({
    startPayment: builder.mutation({
      query: (paymentDetails) => ({
        url: "/start",
        method: "POST",
        body: paymentDetails,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "/verify",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useStartPaymentMutation, useVerifyPaymentMutation } = paymentApi;
