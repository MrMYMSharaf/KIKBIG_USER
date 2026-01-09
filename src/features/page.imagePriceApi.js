import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const imagePriceApiSlice = createApi({
  reducerPath: "imagePriceApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include", // if you use cookies/auth
  }),
  tagTypes: ["ImagePrice"],
  endpoints: (builder) => ({
    // CREATE ImagePrice
    createImagePrice: builder.mutation({
      query: (data) => ({
        url: "/api/pageimageprice",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ImagePrice"],
    }),

    // GET ALL ImagePrices
    getAllImagePrices: builder.query({
      query: () => ({
        url: "/api/pageimageprice",
        method: "GET",
      }),
      providesTags: ["ImagePrice"],
    }),

    // GET ImagePrice by ID
    getImagePriceById: builder.query({
      query: (id) => ({
        url: `/api/pageimageprice/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ImagePrice", id }],
    }),

    // UPDATE ImagePrice
    updateImagePrice: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/api/pageimageprice/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ImagePrice", id }, "ImagePrice"],
    }),

    // DELETE ImagePrice
    deleteImagePrice: builder.mutation({
      query: (id) => ({
        url: `/api/pageimageprice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImagePrice"],
    }),
  }),
});

export const {
  useCreateImagePriceMutation,
  useGetAllImagePricesQuery,
  useGetImagePriceByIdQuery,
  useUpdateImagePriceMutation,
  useDeleteImagePriceMutation,
} = imagePriceApiSlice;

