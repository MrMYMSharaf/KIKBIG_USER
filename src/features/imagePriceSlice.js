// src/features/imagePriceSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const imagePriceApi = createApi({
  reducerPath: "imagePriceApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:4000",
    credentials: 'include',
  }),
  tagTypes: ['ImagePrice'],
  endpoints: (builder) => ({
    // Get all image prices
    getImagePrices: builder.query({
      query: () => ({
        url: `/api/ImagePrice`,
        method: "GET",
      }),
      // 🔥 Transform response to ensure consistent structure
      transformResponse: (response) => {
        // If response is already wrapped with success/data, return as is
        if (response?.data) return response;
        
        // Otherwise wrap it
        return {
          success: true,
          data: response
        };
      },
      providesTags: ['ImagePrice'],
    }),

    // Get image price by ID
    getImagePriceById: builder.query({
      query: (id) => ({
        url: `/api/ImagePrice/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'ImagePrice', id }],
    }),
  }),
});

export const { 
  useGetImagePricesQuery,
  useGetImagePriceByIdQuery,
} = imagePriceApi;

export default imagePriceApi.reducer;