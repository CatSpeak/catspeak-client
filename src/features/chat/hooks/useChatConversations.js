import { useMemo, useEffect } from "react"
import { useDispatch } from "react-redux"
import {
  conversationsApi,
  useGetConversationsQuery,
  useMarkConversationAsReadMutation,
} from "@/store/api/social/conversationsApi"
import { clearUnread } from "@/store/slices/notificationSlice"

/**
 * Custom hook for fetching conversation lists, formatting active conversation details,
 * and managing unread count sync and auto-mark-as-read side-effects.
 *
 * @param {string|number|null} selectedId - The currently selected conversation ID
 * @param {number} accumulatedMessagesCount - Total length of currently accumulated messages for active conversation
 */
export default function useChatConversations(selectedId, accumulatedMessagesCount = 0) {
  const dispatch = useDispatch()

  const {
    data: conversationsResponse = [],
    isLoading: isLoadingConversations,
  } = useGetConversationsQuery()

  const [markConversationAsRead] = useMarkConversationAsReadMutation()

  const conversations = useMemo(() => {
    const list = Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []

    if (!selectedId) return list

    return list.map((c) => {
      const cId = c.conversationId ?? c.id
      if (
        Number(cId) === Number(selectedId) ||
        String(cId) === String(selectedId)
      ) {
        return { ...c, unreadCount: 0 }
      }
      return c
    })
  }, [conversationsResponse, selectedId])

  // Automatically mark active conversation as read when selected, when new messages arrive, or when conversation list updates while viewing
  useEffect(() => {
    if (!selectedId) return

    const rawList = Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []

    const currentCached = rawList.find(
      (c) =>
        Number(c.conversationId ?? c.id) === Number(selectedId) ||
        String(c.conversationId ?? c.id) === String(selectedId),
    )

    // Clear unread if active conversation has unread items in RTK Query cache
    if (!currentCached || currentCached.unreadCount > 0) {
      dispatch(clearUnread(selectedId))
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations",
          undefined,
          (draft) => {
            const cachedConv = draft.find(
              (c) =>
                Number(c.conversationId ?? c.id) === Number(selectedId) ||
                String(c.conversationId ?? c.id) === String(selectedId),
            )
            if (cachedConv) {
              cachedConv.unreadCount = 0
            }
          },
        ),
      )
      markConversationAsRead(selectedId).catch(() => {})
    }
  }, [
    selectedId,
    accumulatedMessagesCount,
    conversationsResponse,
    markConversationAsRead,
    dispatch,
  ])

  const activeConversationRaw = useMemo(() => {
    return conversations.find((c) => c.conversationId === selectedId) || null
  }, [conversations, selectedId])

  const activeConversation = useMemo(() => {
    if (!activeConversationRaw) return null
    return {
      id: activeConversationRaw.conversationId,
      type: activeConversationRaw.isGroup ? "group" : "direct",
      name: activeConversationRaw.isGroup
        ? activeConversationRaw.groupName
        : activeConversationRaw.friend?.username || "Chat",
      participants: activeConversationRaw.participants || [],
      unreadCount: activeConversationRaw.unreadCount || 0,
      typing: [], // Typing indicators are currently not supported by backend spec
      friend: activeConversationRaw.friend,
      isGroup: activeConversationRaw.isGroup,
      groupName: activeConversationRaw.groupName,
      groupAvatar: activeConversationRaw.groupAvatar,
    }
  }, [activeConversationRaw])

  return {
    conversations,
    activeConversation,
    isLoadingConversations,
    conversationsResponse,
  }
}
