import { socialApi } from "./socialApi"

// Conversations API slice
export const conversationsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for current user
    getConversations: builder.query({
      query: () => "/conversations",
      providesTags: ["Conversations"],
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
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
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
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Mark a conversation as read
    markConversationAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PUT",
      }),
    }),

    // Add new participants to a group conversation
    addParticipants: builder.mutation({
      query: ({ conversationId, accountIds }) => ({
        url: `/conversations/${conversationId}/participants`,
        method: "POST",
        body: accountIds,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Remove a participant from a group conversation or leave the group
    removeParticipant: builder.mutation({
      query: ({ conversationId, accountId }) => ({
        url: `/conversations/${conversationId}/participants/${accountId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Get list of available support staff members
    getSupportStaff: builder.query({
      query: () => "/conversations/staff",
      providesTags: ["Conversations"],
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetConversationsQuery,
  useCreatePrivateConversationMutation,
  useCreateGroupConversationMutation,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  useGetSupportStaffQuery,
} = conversationsApi

