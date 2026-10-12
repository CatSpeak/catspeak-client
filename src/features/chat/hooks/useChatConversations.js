import { useMemo, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import {
  conversationsApi,
  useGetConversationsQuery,
  useMarkConversationAsReadMutation,
} from "@/store/api/social/conversationsApi"
import { clearUnread } from "@/store/slices/notificationSlice"
import useConversationSignalR from "./useConversationSignalR"

/**
 * Custom hook for fetching conversation lists, formatting active conversation details,
 * and managing unread count sync and auto-mark-as-read side-effects.
 *
 * @param {string|number|null} selectedId - The currently selected conversation ID
 * @param {number} accumulatedMessagesCount - Total length of currently accumulated messages for active conversation
 */
export default function useChatConversations(selectedId) {
  const dispatch = useDispatch()
  const lastMarkedConvRef = useRef(null)

  // Real-time group governance updates
  const signalRHandlers = useMemo(
    () => ({
      GroupUpdated: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations", "Messages"]))
      },
      MemberRoleChanged: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations", "Members"]))
      },
      OwnershipTransferred: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations", "Members"]))
      },
      MemberLeft: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations", "Members", "Messages"]))
      },
      ConversationUpdated: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations", "Members", "Messages"]))
      },
    }),
    [dispatch],
  )
  useConversationSignalR(signalRHandlers)

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

  // Automatically mark active conversation as read when selected or when new unread messages arrive for it
  useEffect(() => {
    if (!selectedId) {
      lastMarkedConvRef.current = null
      return
    }

    const rawList = Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []

    const currentCached = rawList.find(
      (c) =>
        Number(c.conversationId ?? c.id) === Number(selectedId) ||
        String(c.conversationId ?? c.id) === String(selectedId),
    )

    // Clear unread only if active conversation has unread items in RTK Query cache
    if (
      currentCached &&
      currentCached.unreadCount > 0 &&
      lastMarkedConvRef.current !== selectedId
    ) {
      lastMarkedConvRef.current = selectedId
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
    conversationsResponse,
    markConversationAsRead,
    dispatch,
  ])

  const activeConversationRaw = useMemo(() => {
    if (!selectedId) return null
    return (
      conversations.find((c) => {
        const cId = c.conversationId ?? c.id
        return (
          Number(cId) === Number(selectedId) ||
          String(cId) === String(selectedId)
        )
      }) || null
    )
  }, [conversations, selectedId])

  const activeConversation = useMemo(() => {
    if (!activeConversationRaw) return null
    return {
      ...activeConversationRaw,
      id: activeConversationRaw.conversationId ?? activeConversationRaw.id,
      createdById: activeConversationRaw.createdById,
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
