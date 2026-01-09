// features/paymentApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    startPayment: builder.mutation({
      query: (paymentDetails) => ({
        url: "/payment/start", // ✅ Fixed: was "/start"
        method: "POST",
        body: paymentDetails,
      }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "/payment/verify", // ✅ Fixed: was "/verify"
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useStartPaymentMutation, useVerifyPaymentMutation } = paymentApi;