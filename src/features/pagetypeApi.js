import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pagetypeApi = createApi({
  reducerPath: "pagetypeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000", // your backend base URL
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // GET ALL PageTypes
    getPageTypes: builder.query({
      query: () => ({
        url: "/api/pageType",
        method: "GET",
      }),
    }),

    
  }),
});

export const {
  useGetPageTypesQuery,
} = pagetypeApi;
