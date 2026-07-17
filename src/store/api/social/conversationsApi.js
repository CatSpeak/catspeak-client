import { socialApi } from "./socialApi"

// Conversations API slice
export const conversationsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for current user
    getConversations: builder.query({
      query: () => "/conversations",
      providesTags: ["Conversations"],
    }),

    // Create a new conversation (legacy)
    createConversation: builder.mutation({
      query: (conversationData) => ({
        url: "/conversations",
        method: "POST",
        body: conversationData,
      }),
      invalidatesTags: ["Conversations"],
    }),

    // Create a private conversation
    createPrivateConversation: builder.mutation({
      query: (targetAccountId) => ({
        url: "/conversations/private",
        method: "POST",
        params: { targetAccountId },
      }),
      invalidatesTags: ["Conversations"],
    }),

    // Create a group conversation
    createGroupConversation: builder.mutation({
      query: (groupData) => ({
        url: "/conversations/group",
        method: "POST",
        body: groupData,
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
  useCreatePrivateConversationMutation,
  useCreateGroupConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
} = conversationsApi
