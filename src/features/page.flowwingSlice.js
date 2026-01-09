import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageFollowingApiSlice = createApi({
  reducerPath: "pageFollowingApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include", // if you use cookies/auth
  }),
  tagTypes: ["PageFollowing"],
  endpoints: (builder) => ({
    // FOLLOW A PAGE
    followPage: builder.mutation({
      query: (data) => ({
        url: "/api/page-following/follow",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PageFollowing"],
    }),

    // UNFOLLOW A PAGE
    unfollowPage: builder.mutation({
      query: (data) => ({
        url: "/api/page-following/unfollow",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PageFollowing"],
    }),

    // CHECK IF USER IS FOLLOWING PAGE
    isFollowingPage: builder.query({
      query: ({ userId, pageId }) => ({
        url: `/api/page-following/is-following?userId=${userId}&pageId=${pageId}`,
        method: "GET",
      }),
      providesTags: ["PageFollowing"],
    }),

    // GET ALL PAGES FOLLOWED BY USER
    getUserFollowedPages: builder.query({
      query: ({ userId, page = 1, limit = 20 }) =>
        `/api/page-following/user/${userId}/pages?page=${page}&limit=${limit}`,
      providesTags: ["PageFollowing"],
    }),

    // GET ALL FOLLOWERS OF A PAGE
    getPageFollowers: builder.query({
      query: (pageId) => `/api/page-following/page/${pageId}/followers`,
      providesTags: ["PageFollowing"],
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
