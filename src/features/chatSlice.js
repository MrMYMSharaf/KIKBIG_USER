import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/mychatgroup",
    credentials: "include", // 🔥 sends JWT cookies
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Messages", "ChatList"],
  endpoints: (builder) => ({

    // --------------------------------------------------
    // SEND MESSAGE (senderId from JWT)
    // --------------------------------------------------
    sendMessage: builder.mutation({
      query: ({ receiverId, receiverType, message }) => ({
        url: "/message",
        method: "POST",
        body: { receiverId, receiverType, message }, // ✅ Added receiverType
      }),
      invalidatesTags: ["Messages", "ChatList"],
    }),

    // --------------------------------------------------
    // GET MESSAGES (logged-in user from JWT)
    // --------------------------------------------------
    getMessages: builder.query({
      query: ({ receiverId, receiverType }) => ({
        url: `/messages?receiverId=${receiverId}&receiverType=${receiverType}`, // ✅ Added receiverType
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),

    // --------------------------------------------------
    // GET CHAT LIST (userId from JWT)
    // --------------------------------------------------
    getChatList: builder.query({
      query: () => ({
        url: "/messages/chats",
        method: "GET",
      }),
      providesTags: ["ChatList"],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetChatListQuery,
} = chatApi;