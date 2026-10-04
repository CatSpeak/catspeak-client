import { useCallback, useMemo } from "react"
import { useInChatCallContext } from "../context/useInChatCallContext.js"
import { useGetConversationsQuery } from "@/store/api/social/conversationsApi"

/**
 * useInChatCall — Hook bridging local conversation components (ChatHeader, ActiveCallBanner)
 * with the global InChatCallProvider.
 *
 * Supports both:
 * - useInChatCall(conversation, currentUser)
 * - useInChatCall(conversationId, currentUser)
 * - useInChatCall()
 */
export default function useInChatCall(conversationOrId) {
  const context = useInChatCallContext()

  const convId =
    typeof conversationOrId === "object" && conversationOrId !== null
      ? conversationOrId?.id || conversationOrId?.conversationId
      : conversationOrId

  const { data: conversationsResponse } = useGetConversationsQuery(undefined, {
    skip: !convId,
  })

  const resolvedConversation = useMemo(() => {
    if (typeof conversationOrId === "object" && conversationOrId !== null) {
      return conversationOrId
    }
    if (!convId) return null

    const list = Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []

    return (
      list.find((c) => Number(c.id || c.conversationId) === Number(convId)) || {
        id: convId,
        conversationId: convId,
      }
    )
  }, [conversationOrId, convId, conversationsResponse])

  const startCall = useCallback(
    (targetConvOrType = "video", maybeType) => {
      if (typeof targetConvOrType === "object" && targetConvOrType !== null) {
        return context.startCall(targetConvOrType, maybeType || "video")
      }
      return context.startCall(
        resolvedConversation,
        targetConvOrType || "video",
      )
    },
    [context, resolvedConversation],
  )

  const joinCall = useCallback(
    (targetConvOrCallInfo, maybeCallInfo) => {
      if (maybeCallInfo !== undefined) {
        return context.joinCall(targetConvOrCallInfo, maybeCallInfo)
      }
      return context.joinCall(resolvedConversation, targetConvOrCallInfo)
    },
    [context, resolvedConversation],
  )

  return {
    ...context,
    startCall,
    joinCall,
  }
}
