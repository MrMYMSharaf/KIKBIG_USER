import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageReviewApiSlice = createApi({
  reducerPath: "pageReviewApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/pageReview",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include", // ✅ Sends HttpOnly cookies automatically
  }),
  tagTypes: ["PageReview", "Page"],
  endpoints: (builder) => ({
    // ✅ CREATE OR UPDATE REVIEW
    createOrUpdateReview: builder.mutation({
      query: (data) => ({
        url: "/review",
        method: "POST",
        body: data, // { pageId, rating, comment }
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: "PageReview", id: pageId },
        { type: "Page", id: pageId },
      ],
    }),

    // ✅ GET ALL REVIEWS FOR A PAGE
    getPageReviews: builder.query({
      query: ({ pageId, page = 1, limit = 20 }) =>
        `/page/${pageId}/reviews?page=${page}&limit=${limit}`,
      providesTags: (result, error, { pageId }) => [
        { type: "PageReview", id: pageId },
      ],
    }),

    // ✅ GET CURRENT USER'S REVIEW FOR A PAGE
    getUserReviewForPage: builder.query({
      query: ({ pageId }) => `/page/${pageId}/my-review`,
      providesTags: (result, error, { pageId }) => [
        { type: "PageReview", id: `user-${pageId}` },
      ],
    }),

    // ✅ DELETE REVIEW
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/review/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PageReview", "Page"],
    }),
  }),
});

export const {
  useCreateOrUpdateReviewMutation,
  useGetPageReviewsQuery,
  useGetUserReviewForPageQuery,
  useDeleteReviewMutation,
} = pageReviewApiSlice;