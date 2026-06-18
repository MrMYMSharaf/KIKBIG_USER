// src/features/bannerSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    // Get active banners (public route)
    activeBanners: builder.query({
      query: () => ({
        url: "/api/offer-banners/active",
        method: "GET",
      }),
      providesTags: ["Banner"],
    }),
    
    // Get all banners with pagination (admin route)
    allBanners: builder.query({
      query: (params) => ({
        url: "/api/offer-banners",
        method: "GET",
        params, // { page, limit, isActive }
      }),
      providesTags: ["Banner"],
    }),
    
    // Get single banner by ID
    bannerById: builder.query({
      query: (id) => ({
        url: `/api/offer-banners/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Banner", id }],
    }),
  }),
});

// Export hooks
export const { 
  useActiveBannersQuery,
  useAllBannersQuery,
  useBannerByIdQuery,
} = bannerApi;