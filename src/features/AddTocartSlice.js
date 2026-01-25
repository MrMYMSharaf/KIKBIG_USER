import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const AddTocartApi = createApi({
  reducerPath: "AddTocartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include", // send cookies
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // ➕ Add to cart
    addToCart: builder.mutation({
      query: ({ post_id }) => ({
        url: "/api/cart",
        method: "POST",
        body: { post_id },
      }),
      invalidatesTags: ["Cart"],
    }),

    // 📦 Get my cart items
    getMyCart: builder.query({
      query: () => "/api/cart",
      providesTags: ["Cart"],
    }),

    // ❌ Remove single item
    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `/api/cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // 🧹 Clear entire cart
    clearCart: builder.mutation({
      query: () => ({
        url: "/api/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetMyCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = AddTocartApi;
