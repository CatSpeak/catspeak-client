import { socialApi } from "./socialApi"
import { maskBody } from "@/shared/utils/moderation"

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

    // Get messages from a conversation (supports cursor beforeId & limit, as well as legacy pagination)
    getConversationMessages: builder.query({
      query: (arg) => {
        const conversationId =
          typeof arg === "object" && arg !== null ? arg.conversationId : arg
        const beforeId =
          typeof arg === "object" && arg !== null ? arg.beforeId : undefined
        const limit =
          typeof arg === "object" && arg !== null ? arg.limit : undefined
        const page =
          typeof arg === "object" && arg !== null ? arg.page : undefined
        const pageSize =
          typeof arg === "object" && arg !== null ? arg.pageSize : undefined

        const params = {}
        if (beforeId !== undefined) params.beforeId = beforeId
        if (limit !== undefined) params.limit = limit
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
      // [Moderation] Che ★ trước khi gửi. Social API là microservice riêng, không
      // có chỗ nào phía server để chen kiểm duyệt vào — xem shared/utils/moderation.js
      queryFn: async (
        { conversationId, messageData },
        api,
        extraOptions,
        baseQuery,
      ) =>
        baseQuery({
          url: `/conversations/${conversationId}/messages`,
          method: "POST",
          body: await maskBody(api, messageData),
        }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
        "Conversations",
      ],
    }),

    // Send a media message in a conversation (multipart/form-data)
    sendMediaMessage: builder.mutation({
      // [Moderation] Chú thích kèm ảnh/tệp cũng là text người dùng gõ.
      queryFn: async (
        { conversationId, formData },
        api,
        extraOptions,
        baseQuery,
      ) =>
        baseQuery({
          url: `/conversations/${conversationId}/messages/media`,
          method: "POST",
          body: await maskBody(api, formData),
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
        { type: "Members", id: Number(conversationId) },
        { type: "Members", id: String(conversationId) },
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Get list of available support staff members
    getSupportStaff: builder.query({
      query: () => "/conversations/staff",
      providesTags: ["Conversations"],
    }),

    // Edit message content
    editMessage: builder.mutation({
      queryFn: async (
        { conversationId, messageId, messageContent },
        api,
        extraOptions,
        baseQuery,
      ) =>
        baseQuery({
          url: `/conversations/${conversationId}/messages/${messageId}`,
          method: "PUT",
          body: await maskBody(api, { messageContent }),
        }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Toggle reaction on a message
    toggleReaction: builder.mutation({
      query: ({ conversationId, messageId, emoji }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/reactions`,
        method: "POST",
        body: { emoji },
      }),
    }),

    // Get reactions detail for a message
    getMessageReactions: builder.query({
      query: ({ conversationId, messageId }) =>
        `/conversations/${conversationId}/messages/${messageId}/reactions`,
    }),

    // Get pinned messages of a conversation
    getPinnedMessages: builder.query({
      query: (conversationId) => `/conversations/${conversationId}/pins`,
      providesTags: (result, error, conversationId) => [
        { type: "PinnedMessages", id: Number(conversationId) },
        { type: "PinnedMessages", id: String(conversationId) },
      ],
    }),

    // Pin a message
    pinMessage: builder.mutation({
      query: ({ conversationId, messageId }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/pin`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "PinnedMessages", id: Number(conversationId) },
        { type: "PinnedMessages", id: String(conversationId) },
      ],
    }),

    // Unpin a message
    unpinMessage: builder.mutation({
      query: ({ conversationId, messageId }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/pin`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: "PinnedMessages", id: Number(conversationId) },
        { type: "PinnedMessages", id: String(conversationId) },
      ],
    }),

    // Forward a message to multiple target conversations
    forwardMessages: builder.mutation({
      query: ({ sourceMessageId, targetConversationIds, comment }) => ({
        url: "/conversations/messages/forward",
        method: "POST",
        body: {
          sourceMessageId,
          targetConversationIds,
          ...(comment ? { comment } : {}),
        },
      }),
      invalidatesTags: (result, error, { targetConversationIds = [] }) => [
        "Conversations",
        ...targetConversationIds.flatMap((id) => [
          { type: "Messages", id: Number(id) },
          { type: "Messages", id: String(id) },
        ]),
      ],
    }),

    // Route-specific forward for a message
    forwardMessageById: builder.mutation({
      query: ({ conversationId, messageId, targetConversationIds }) => ({
        url: `/conversations/${conversationId}/messages/${messageId}/forward`,
        method: "POST",
        body: { targetConversationIds },
      }),
      invalidatesTags: (result, error, { targetConversationIds = [] }) => [
        "Conversations",
        ...targetConversationIds.flatMap((id) => [
          { type: "Messages", id: Number(id) },
          { type: "Messages", id: String(id) },
        ]),
      ],
    }),

    // Get shared media / files / links / audio gallery for a conversation
    getConversationMedia: builder.query({
      query: ({ conversationId, type = "all", beforeId, limit = 30 }) => {
        const params = { type, limit }
        if (beforeId !== undefined && beforeId !== null) params.beforeId = beforeId
        return {
          url: `/conversations/${conversationId}/media`,
          params,
        }
      },
      providesTags: (result, error, { conversationId }) => [
        { type: "Messages", id: Number(conversationId) },
        { type: "Messages", id: String(conversationId) },
      ],
    }),

    // Search messages in a conversation
    searchConversationMessages: builder.query({
      query: ({ conversationId, query, beforeId, limit = 20 }) => {
        const params = { query, limit }
        if (beforeId !== undefined && beforeId !== null) params.beforeId = beforeId
        return {
          url: `/conversations/${conversationId}/messages/search`,
          params,
        }
      },
    }),

    // ── Phase 3: @Mentions & Group Governance Endpoints ──

    // Get members of conversation (Single source of truth with roles: isOwner, isAdmin, isOnline)
    getConversationMembers: builder.query({
      query: (arg) => {
        const conversationId =
          typeof arg === "object" && arg !== null ? arg.conversationId : arg
        const query =
          typeof arg === "object" && arg !== null ? arg.query : undefined
        return {
          url: `/conversations/${conversationId}/members`,
          params: query ? { query } : undefined,
        }
      },
      providesTags: (result, error, arg) => {
        const conversationId =
          typeof arg === "object" && arg !== null ? arg.conversationId : arg
        return [
          { type: "Members", id: Number(conversationId) },
          { type: "Members", id: String(conversationId) },
          "Members",
        ]
      },
    }),

    // Update group info (Name & Avatar, Owner/Admin)
    updateGroupInfo: builder.mutation({
      query: ({ conversationId, groupName, groupAvatar }) => ({
        url: `/conversations/${conversationId}/group-info`,
        method: "PUT",
        body: { groupName, groupAvatar },
      }),
      invalidatesTags: ["Conversations"],
    }),

    // Promote participant to Admin (Owner only)
    promoteParticipant: builder.mutation({
      query: ({ conversationId, accountId }) => ({
        url: `/conversations/${conversationId}/participants/${accountId}/promote`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Members", id: Number(conversationId) },
        { type: "Members", id: String(conversationId) },
      ],
    }),

    // Demote Admin to Member (Owner only)
    demoteParticipant: builder.mutation({
      query: ({ conversationId, accountId }) => ({
        url: `/conversations/${conversationId}/participants/${accountId}/demote`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Members", id: Number(conversationId) },
        { type: "Members", id: String(conversationId) },
      ],
    }),

    // Transfer group ownership to another member (Owner only)
    transferOwnership: builder.mutation({
      query: ({ conversationId, newOwnerAccountId }) => ({
        url: `/conversations/${conversationId}/transfer-ownership`,
        method: "PUT",
        body: { newOwnerAccountId },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        "Conversations",
        { type: "Members", id: Number(conversationId) },
        { type: "Members", id: String(conversationId) },
      ],
    }),

    // Leave group (Owner must transfer ownership first)
    leaveGroup: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, conversationId) => [
        "Conversations",
        { type: "Members", id: Number(conversationId) },
        { type: "Members", id: String(conversationId) },
      ],
    }),

    // ── Phase 3: In-Chat LiveKit Calls ───────────────────

    // Initiate voice or video call
    initiateCall: builder.mutation({
      query: ({ conversationId, callType = "video" }) => ({
        url: `/conversations/${conversationId}/calls/initiate`,
        method: "POST",
        body: { callType },
      }),
    }),

    // Join active call
    joinCall: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/calls/join`,
        method: "POST",
      }),
    }),

    // End or leave active call
    endCall: builder.mutation({
      query: ({ conversationId, forceEnd = false }) => ({
        url: `/conversations/${conversationId}/calls/end`,
        method: "POST",
        params: { forceEnd },
      }),
    }),

    // Get active call status for conversation
    getActiveCall: builder.query({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/calls/active`,
      }),
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetConversationsQuery,
  useCreatePrivateConversationMutation,
  useCreateGroupConversationMutation,
  useGetConversationMessagesQuery,
  useLazyGetConversationMessagesQuery,
  useSendMessageMutation,
  useSendMediaMessageMutation,
  useDeleteMessageForMeMutation,
  useRecallMessageMutation,
  useMarkConversationAsReadMutation,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  useGetSupportStaffQuery,
  useEditMessageMutation,
  useToggleReactionMutation,
  useGetMessageReactionsQuery,
  useGetPinnedMessagesQuery,
  usePinMessageMutation,
  useUnpinMessageMutation,
  useForwardMessagesMutation,
  useForwardMessageByIdMutation,
  useGetConversationMediaQuery,
  useLazyGetConversationMediaQuery,
  useSearchConversationMessagesQuery,
  useLazySearchConversationMessagesQuery,
  useUpdateGroupInfoMutation,
  usePromoteParticipantMutation,
  useDemoteParticipantMutation,
  useTransferOwnershipMutation,
  useLeaveGroupMutation,
  useInitiateCallMutation,
  useJoinCallMutation,
  useEndCallMutation,
  useGetActiveCallQuery,
  useLazyGetActiveCallQuery,
  useGetConversationMembersQuery,
  useLazyGetConversationMembersQuery,
} = conversationsApi



