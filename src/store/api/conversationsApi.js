import { baseApi } from "./baseApi"

// Conversations API slice
export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for current user
    getConversations: builder.query({
      query: () => "/conversations",
      providesTags: ["Conversations"],
    }),

    // Create a new conversation
    createConversation: builder.mutation({
      query: (conversationData) => ({
        url: "/conversations",
        method: "POST",
        body: conversationData,
      }),
      invalidatesTags: ["Conversations"],
    }),

    // Get messages from a conversation
    getConversationMessages: builder.query({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      providesTags: (result, error, conversationId) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // Send a message in a conversation
    sendMessage: builder.mutation({
      query: ({ conversationId, messageData }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: conversationId },
      ],
    }),

    // Send a message to public AI
    chatPublicAi: builder.mutation({
      query: (data) => ({
        url: "/conversations/ai/public-ai",
        method: "POST",
        body: data,
      }),
    }),

    // Send a message to private AI
    chatPrivateAi: builder.mutation({
      query: (data) => ({
        url: "/conversations/ai/private-ai",
        method: "POST",
        body: data,
      }),
    }),

    // Mark a conversation as read
    markConversationAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PUT",
      }),
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
  useMarkConversationAsReadMutation,
} = conversationsApi
