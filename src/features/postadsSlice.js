// src/features/postadsSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const postadvertisementApi = createApi({
  reducerPath: "postadvertisementApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:4000",
    credentials: 'include',
  }),
  tagTypes: ['Advertisement'],
  endpoints: (builder) => ({
    startadvertisement: builder.mutation({
      query: (formData) => ({
        url: "/api/advertisement",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Advertisement'],
    }),

    getAllAdvertisements: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ['Advertisement'],
    }),

    // ✅ FIXED: Updated endpoint path
    getMyAdvertisements: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement/my-ads`,
        method: "GET",
        params: {page, limit },
      }),
      providesTags: ["Advertisement"],
    }),

    getAdvertisementById: builder.query({
      query: (id) => ({
        url: `/api/advertisement/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Advertisement", id }],
    }),

    getAllAdvertisementsAds: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement/ads`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ['Advertisement'],
    }),

    getAllAdvertisementsNeeds: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement/needs`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ['Advertisement'],
    }),

    getAllAdvertisementsOffers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement/offers`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ['Advertisement'],
    }),

    // ✅ SLUG-BASED: Get advertisements by category/subcategory using slugs
    getAdvertisementsByCategory: builder.query({
  query: ({ countrySlug, categorySlug, subCategorySlug, page = 1, limit = 10 }) => {
    let url = '/api/advertisement';
    
    if (countrySlug && categorySlug) {
      url += `/${countrySlug}/${categorySlug}`;
      
      // ✅ only append if subCategorySlug is truthy
      if (subCategorySlug && subCategorySlug !== "undefined") {
        url += `/${subCategorySlug}`;
      }
    } else if (categorySlug) {
      url += `/all/${categorySlug}`;
      
      if (subCategorySlug && subCategorySlug !== "undefined") {
        url += `/${subCategorySlug}`;
      }
    }

    return {
      url,
      method: "GET",
      params: { page, limit },
    };
  },
  providesTags: ['Advertisement'],
}),


    updateAdvertisement: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/advertisement/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Advertisement", id },
        'Advertisement',
      ],
    }),

    deleteAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/api/advertisement/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Advertisement", id },
        'Advertisement',
      ],
    }),
  }),
});

export const { 
  useStartadvertisementMutation, 
  useGetAllAdvertisementsQuery,
  useUpdateAdvertisementMutation,
  useGetAllAdvertisementsAdsQuery,
  useGetMyAdvertisementsQuery,
  useGetAllAdvertisementsNeedsQuery,
  useGetAllAdvertisementsOffersQuery,
  useDeleteAdvertisementMutation, 
  useGetAdvertisementByIdQuery,
  useGetAdvertisementsByCategoryQuery,
} = postadvertisementApi;