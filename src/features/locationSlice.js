import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    location: builder.query({
      query: (params) => ({
        url: "api/geolocation",
        method: "GET",
        params, // optional query parameters
      }),
    }),
  }),
});

// Correct hook name
export const { useLocationQuery } = locationApi;
