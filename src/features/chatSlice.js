import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/mychatgroup",
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Messages", "ChatList"],
  endpoints: (builder) => ({
    // ✅ Send message as user
    sendMessage: builder.mutation({
      query: ({ receiverId, receiverType, message }) => ({
        url: "/message",
        method: "POST",
        body: { receiverId, receiverType, message },
      }),
      invalidatesTags: ["Messages", "ChatList"],
      transformErrorResponse: (response) => {
        console.error("Send message error:", response);
        return response;
      },
    }),

    // ✅ NEW: Send message as page
    sendMessageAsPage: builder.mutation({
      query: ({ pageId, receiverId, receiverType, message }) => ({
        url: "/message/page",
        method: "POST",
        body: { pageId, receiverId, receiverType, message },
      }),
      invalidatesTags: ["Messages", "ChatList"],
      transformErrorResponse: (response) => {
        console.error("Send page message error:", response);
        return response;
      },
    }),

    // ✅ Get messages
    getMessages: builder.query({
      query: ({ receiverId, receiverType }) => ({
        url: `/messages?receiverId=${receiverId}&receiverType=${receiverType}`,
        method: "GET",
      }),
      providesTags: ["Messages"],
      transformErrorResponse: (response) => {
        console.error("Get messages error:", response);
        return response;
      },
    }),

    // ✅ Get chat list with optional page filter
    getChatList: builder.query({
      query: (pageId) => {
        const url = pageId && pageId !== 'all'
          ? `/messages/chats?pageId=${pageId}`
          : '/messages/chats';
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["ChatList"],
      transformErrorResponse: (response) => {
        console.error("Get chat list error:", response);
        return response;
      },
    }),
  }),
});

export const {
  useSendMessageMutation,
  useSendMessageAsPageMutation, // ✅ NEW
  useGetMessagesQuery,
  useGetChatListQuery,
} = chatApi;