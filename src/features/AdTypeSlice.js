// src/services/adtypeApi.js
import { createApi, fetchBaseQuery  } from "@reduxjs/toolkit/query/react";


export const adtypeApi = createApi({
  reducerPath: "adtypeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }), // 👈 reused from baseApi.js
  endpoints: (builder) => ({
    adtype: builder.query({
      query: (params) => ({
        url: "/api/adtype",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useAdtypeQuery } = adtypeApi;
