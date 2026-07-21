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

    // Get messages from a conversation (supports pagination)
    getConversationMessages: builder.query({
      query: (arg) => {
        const conversationId =
          typeof arg === "object" && arg !== null ? arg.conversationId : arg
        const page = typeof arg === "object" && arg !== null ? arg.page : undefined
        const pageSize =
          typeof arg === "object" && arg !== null ? arg.pageSize : undefined

        const params = {}
        if (page !== undefined) params.page = page
        if (pageSize !== undefined) params.pageSize = pageSize

        return {
          url: `/conversations/${conversationId}/messages`,
          params,
        }
      },
      providesTags: (result, error, arg) => {
        const conversationId =
          typeof arg === "object" && arg !== null ? arg.conversationId : arg
        return [
          { type: "Messages", id: Number(conversationId) },
          { type: "Messages", id: String(conversationId) },
        ]
      },
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
        "Conversations",
      ],
    }),

    // Send a media message in a conversation (multipart/form-data)
    sendMediaMessage: builder.mutation({
      query: ({ conversationId, formData }) => ({
        url: `/conversations/${conversationId}/messages/media`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
        "Conversations",
      ],
    }),

    // Soft delete a message for current user only
    deleteMessageForMe: builder.mutation({
      query: ({ conversationId, messageId }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/delete-for-me`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Recall / hard delete message for everyone (Strictly restricted to message owner)
    recallMessage: builder.mutation({
      query: ({ conversationId, messageId }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/recall`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
        "Conversations",
      ],
    }),

    // Mark a conversation as read
    markConversationAsRead: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
        "Conversations",
      ],
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
  useSendMediaMessageMutation,
  useDeleteMessageForMeMutation,
  useRecallMessageMutation,
  useMarkConversationAsReadMutation,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  useGetSupportStaffQuery,
} = conversationsApi
