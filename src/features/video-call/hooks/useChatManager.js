import { useChat } from "@livekit/components-react"
import { useSystemMessages } from "./useSystemMessages"
import { useAiMessages } from "./useAiMessages"
import { useUnreadTracking } from "./useUnreadTracking"
import {
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
} from "@/store/api/aiApi"

export const useChatManager = ({
  lkRoom,
  receiveSystemMsgs,
  currentUserId,
  participants,
  panelState,
}) => {
  const chatState = useChat()
  const baseChatMessages = chatState.chatMessages ?? []
  const chatSend = chatState.send ?? (() => { })

  const systemMessages = useSystemMessages(lkRoom, receiveSystemMsgs)

  const {
    aiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
  } = useAiMessages(lkRoom, currentUserId, participants)

  const [chatPublicAi] = useChatPublicAiMutation()
  const [chatPrivateAi] = useChatPrivateAiMutation()

  // Parse reply metadata from chat messages
  const chatMessages = baseChatMessages.map((msg) => {
    try {
      const json = JSON.parse(msg.message)
      if (json && json.isReply) {
        return { ...msg, message: json.text, replyTo: json.replyTo }
      }
    } catch {
      // not JSON or not a reply
    }
    return msg
  })

  const combinedAiMessages = [...aiMessages, ...systemMessages].sort(
    (a, b) => a.timestamp - b.timestamp,
  )

  const { unreadRoomChat, setUnreadRoomChat, unreadAiChat, setUnreadAiChat } =
    useUnreadTracking({
      chatMessages,
      combinedAiMessages,
      showChat: panelState.showChat,
      isChatCollapsed: panelState.isChatCollapsed,
      isAiCollapsed: panelState.isAiCollapsed,
      participants,
    })

  return {
    chatSend,
    chatMessages,
    combinedAiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
    chatPublicAi,
    chatPrivateAi,
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
  }
}
