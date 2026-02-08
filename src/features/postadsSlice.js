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

    getMyAdvertisements: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/api/advertisement/my-ads`,
        method: "GET",
        params: {page, limit },
      }),
      providesTags: ["Advertisement"],
    }),

    // ✅ NEW: Get advertisements by page ID
    getAdvertisementsByPageId: builder.query({
      query: ({ pageId, page = 1, limit = 20 } = {}) => ({
        url: `/api/advertisement/page/${pageId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result, error, { pageId }) => [
        { type: "Advertisement", id: `PAGE-${pageId}` },
        'Advertisement'
      ],
    }),

    getAdvertisementById: builder.query({
      query: (id) => ({
        url: `/api/advertisement/view/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Advertisement", id }],
      keepUnusedDataFor: 5,
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

    getAdvertisementsByCategory: builder.query({
      query: ({ countrySlug, mode, categorySlug, subCategorySlug, page = 1, limit = 10 }) => {
        let url = '/api';
        
        if (countrySlug && categorySlug) {
          const modeSegment = mode || 'viewallads';
          url += `/${countrySlug}/${modeSegment}/${categorySlug}`;
          
          if (subCategorySlug && subCategorySlug !== "undefined") {
            url += `/${subCategorySlug}`;
          }
        } else if (categorySlug) {
          const modeSegment = mode || 'viewallads';
          url += `/${modeSegment}/${categorySlug}`;
          
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

    getAdvertisementsAdsByCountry: builder.query({
      query: ({ countrySlug, page = 1, limit = 12 }) => ({
        url: `/api/${countrySlug}/ads`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Advertisement"],
    }),

    getNeedsByCountry: builder.query({
      query: ({ countrySlug, page = 1, limit = 12 }) => ({
        url: `/api/${countrySlug}/needs`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Advertisement"],
    }),

    getOffersByCountry: builder.query({
      query: ({ countrySlug, page = 1, limit = 12 }) => ({
        url: `/api/${countrySlug}/offers`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Advertisement"],
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

    updateAdvertisementStatus: builder.mutation({
      query: ({ id, status, verificationResult }) => ({
        url: `/api/advertisement/${id}/status`,
        method: "PUT",
        body: { status, verificationResult },
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
  useGetAdvertisementsAdsByCountryQuery,
  useGetNeedsByCountryQuery,
  useGetOffersByCountryQuery, 
  useUpdateAdvertisementStatusMutation,
  useGetAdvertisementsByPageIdQuery, // ✅ NEW: Export the hook
} = postadvertisementApi;