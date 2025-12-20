import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pageApiSlice = createApi({
  reducerPath: "pageApiSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include", // Include cookies for authentication
  }),
  tagTypes: ["Page"],
  endpoints: (builder) => ({
    // CREATE Page
    createPage: builder.mutation({
      query: (pageData) => ({
        url: "/api/page",
        method: "POST",
        body: pageData,
      }),
      invalidatesTags: ["Page"],
    }),

    // GET ALL Pages
    getAllPages: builder.query({
      query: ({ status, category, pagetype } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (category) params.append("category", category);
        if (pagetype) params.append("pagetype", pagetype);
        return {
          url: `/api/page?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Page"],
    }),

    // GET Page by ID
    getPageById: builder.query({
      query: (id) => ({
        url: `/api/page/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Page", id }],
    }),

    // GET Page by Slug
    getPageBySlug: builder.query({
      query: (slug) => ({
        url: `/api/page/slug/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "Page", id: slug }],
    }),

    // UPDATE Page
    updatePage: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/api/page/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Page", id }, "Page"],
    }),

    // DELETE Page
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/api/page/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Page"],
    }),
  }),
});

export const {
  useCreatePageMutation,
  useGetAllPagesQuery,
  useGetPageByIdQuery,
  useGetPageBySlugQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApiSlice;