import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api",
    credentials: 'include', // Important: This sends HTTP-only cookies with requests
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Messages"],
  endpoints: (builder) => ({
    // ✅ Send a new message
    sendMessage: builder.mutation({
      query: (body) => ({
        url: "/message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Messages"],
    }),

    // ✅ Get chat messages between two users (auto marks as read)
    getMessages: builder.query({
      query: ({ senderId, receiverId }) =>
        `/messages?senderId=${senderId}&receiverId=${receiverId}`,
      providesTags: ["Messages"],
    }),

    // ✅ Get chat list
    getChatList: builder.query({
      query: (userId) => `/messages/chats/${userId}`,
      providesTags: ["Messages"],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetChatListQuery,
} = chatApi;