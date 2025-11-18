// src/features/UserTypesSlice.js (better filename)
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseApi";

export const usertypeApi = createApi({
  reducerPath: "usertypeApi",
  baseQuery,
  endpoints: (builder) => ({
    usertype: builder.query({   // ✅ endpoint renamed
      query: (params) => ({
        url: "/api/usertype",
        method: "GET",
        params,
      }),
    }),
  }),
});

// ✅ Hook name will now match
export const { useUsertypeQuery } = usertypeApi;
