import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageApiSlice = createApi({
  reducerPath: "pageApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/mypages/",
    credentials: "include", // ✅ browser sends HttpOnly cookie automatically
  }),
  tagTypes: ["Page"],
  endpoints: (builder) => ({
    // CREATE Page
    createPage: builder.mutation({
      query: (pageData) => ({
        url: "/page",
        method: "POST",
        body: pageData,
      }),
      invalidatesTags: ["Page"],
    }),

    // GET ALL Pages (Public)
    getAllPages: builder.query({
      query: ({ status, category, pagetype } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (pagetype) params.append("pagetype", pagetype);

        return `/page?${params.toString()}`;
      },
      providesTags: ["Page"],
    }),

    // GET MY Pages (Protected - Current User's Pages)
    getMyPages: builder.query({
      query: ({ page = 1, limit = 100, status, category, pagetype } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (pagetype) params.append("pagetype", pagetype);

        return `/page/my-pages?${params.toString()}`;
      },
      providesTags: ["Page"],
    }),

    // GET Page by ID
    getPageById: builder.query({
      query: (id) => `/page/${id}`,
      providesTags: (result, error, id) => [{ type: "Page", id }],
    }),

    // GET Page by Slug
    getPageBySlug: builder.query({
      query: (slug) => `/page/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Page", id: slug }],
    }),
  
    // UPDATE Page
    updatePage: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/page/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Page", id },
        "Page",
      ],
    }),

    // DELETE Page
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/page/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Page"],
    }),
  }),
});

export const {
  useCreatePageMutation,
  useGetAllPagesQuery,
  useGetMyPagesQuery, // ✅ New hook for getting current user's pages
  useGetPageByIdQuery,
  useGetPageBySlugQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApiSlice;

