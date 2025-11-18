// File: features/groupSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const groupApi = createApi({
  reducerPath: "groupApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Groups", "GroupMessages"],
  endpoints: (builder) => ({
    // Create group
    createGroup: builder.mutation({
      query: (body) => ({
        url: "/group",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Groups"],
    }),

    // Get user's groups
    getUserGroups: builder.query({
      query: (userId) => `/groups/${userId}`,
      providesTags: ["Groups"],
    }),

    // Get group details
    getGroupDetails: builder.query({
      query: (groupId) => `/group/${groupId}`,
      providesTags: ["Groups"],
    }),

    // Add members
    addMembers: builder.mutation({
      query: (body) => ({
        url: "/group/add-members",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Groups"],
    }),

    // Remove member
    removeMember: builder.mutation({
      query: (body) => ({
        url: "/group/remove-member",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Groups"],
    }),

    // Leave group
    leaveGroup: builder.mutation({
      query: (body) => ({
        url: "/group/leave",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Groups"],
    }),

    // Get group messages
    getGroupMessages: builder.query({
      query: (groupId) => `/group/messages?groupId=${groupId}`,
      providesTags: ["GroupMessages"],
    }),

    // Send group message
    sendGroupMessage: builder.mutation({
      query: (body) => ({
        url: "/group/message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GroupMessages"],
    }),
  }),
});

export const {
  useCreateGroupMutation,
  useGetUserGroupsQuery,
  useGetGroupDetailsQuery,
  useAddMembersMutation,
  useRemoveMemberMutation,
  useLeaveGroupMutation,
  useGetGroupMessagesQuery,
  useSendGroupMessageMutation,
} = groupApi;