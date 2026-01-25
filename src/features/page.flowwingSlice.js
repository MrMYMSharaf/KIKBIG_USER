import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageFollowingApiSlice = createApi({
  reducerPath: "pageFollowingApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/page-following",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include", // ✅ Sends HttpOnly cookies automatically
  }),
  tagTypes: ["PageFollowing", "Page"],
  endpoints: (builder) => ({
    // ✅ FOLLOW A PAGE
    followPage: builder.mutation({
      query: (data) => ({
        url: "/follow",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PageFollowing", "Page"],
    }),

    // ✅ UNFOLLOW A PAGE
    unfollowPage: builder.mutation({
      query: (data) => ({
        url: "/unfollow",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PageFollowing", "Page"],
    }),

    // ✅ CHECK IF USER IS FOLLOWING PAGE (uses JWT from cookie)
    isFollowingPage: builder.query({
      query: ({ pageId }) => ({
        url: `/check/${pageId}`,
        method: "GET",
      }),
      providesTags: (result, error, { pageId }) => [
        { type: "PageFollowing", id: pageId }
      ],
    }),

    // ✅ GET ALL PAGES FOLLOWED BY USER (uses JWT from cookie)
    getUserFollowedPages: builder.query({
      query: ({ page = 1, limit = 100 } = {}) => 
        `/user/followed?page=${page}&limit=${limit}`,
      providesTags: ["PageFollowing"],
    }),

    // ✅ GET ALL FOLLOWERS OF A PAGE
    getPageFollowers: builder.query({
      query: ({ pageId, page = 1, limit = 50 }) => 
        `/page/${pageId}/followers?page=${page}&limit=${limit}`,
      providesTags: (result, error, { pageId }) => [
        { type: "PageFollowing", id: `${pageId}-followers` }
      ],
    }),
  }),
});

export const {
  useFollowPageMutation,
  useUnfollowPageMutation,
  useIsFollowingPageQuery,
  useGetUserFollowedPagesQuery,
  useGetPageFollowersQuery,
} = pageFollowingApiSlice;