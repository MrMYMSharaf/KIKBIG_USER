import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const languageApi = createApi({
  reducerPath: "languageApi", // matches API name
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    language: builder.query({
      query: (params) => ({
        url: "api/language",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useLanguageQuery } = languageApi;
