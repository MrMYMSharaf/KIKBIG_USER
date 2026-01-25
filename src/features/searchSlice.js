// src/features/searchSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Search"],
  endpoints: (builder) => ({
    // 🔍 UNIFIED SEARCH - YouTube-style (all types)
    unifiedSearch: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        // Add all parameters
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        return `/api/search?${searchParams.toString()}`;
      },
      providesTags: ["Search"],
    }),

    // 🛍️ Search advertisements only
    searchAdvertisements: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        return `/api/search/advertisements?${searchParams.toString()}`;
      },
      providesTags: ["Search"],
    }),

    // 📄 Search pages only
    searchPages: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        return `/api/search/pages?${searchParams.toString()}`;
      },
      providesTags: ["Search"],
    }),

    // 🎛️ Get search filters
    getSearchFilters: builder.query({
      query: ({ country, typeofads = "Advertisement" }) => 
        `/api/search/filters?country=${country}&typeofads=${typeofads}`,
      providesTags: ["Search"],
    }),
  }),
});

export const {
  useUnifiedSearchQuery,
  useSearchAdvertisementsQuery,
  useSearchPagesQuery,
  useGetSearchFiltersQuery,
} = searchApi;