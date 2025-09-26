import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
  reducerPath: "categoryApi", // matches API name
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    category: builder.query({
      query: (params) => ({
        url: "/api/category",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useCategoryQuery } = categoryApi;
