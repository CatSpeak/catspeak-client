import React, { useState, useRef, useEffect, useContext } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  conversationsApi,
} from "@/store/api/conversationsApi"
import useMessageSignalR from "../hooks/useMessageSignalR"
import useClickOutside from "@/shared/hooks/useClickOutside"
import {
  closeWidget,
  openWidget,
  setActiveConversation,
  toggleWidget,
  setView,
} from "@/store/slices/messageWidgetSlice"
import {
  selectTotalUnread,
  clearUnread,
} from "@/store/slices/notificationSlice"
import { MessageCircle } from "lucide-react"
import MessageModal from "./MessageModal"
import ConversationListHeader from "./headers/ConversationListHeader"
import ConversationDetailHeader from "./headers/ConversationDetailHeader"
import ConversationList from "./conversation-list/ConversationList"
import ConversationDetail from "./conversation-detail/ConversationDetail"

const MessageWidget = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useContext(AuthModalContext)
  const { isOpen, activeConversationId, view } = useSelector(
    (state) => state.messageWidget,
  )
  const [input, setInput] = useState("")
  const totalUnreadCountRedux = useSelector(selectTotalUnread)
  const widgetRef = useRef(null)

  // Handle click outside to close
  useClickOutside(
    widgetRef,
    () => {
      dispatch(closeWidget())
    },
    {
      enabled: isOpen,
      ignoreSelector: "[data-message-widget-portal]",
    },
  )

  // Fetch conversations from API
  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useGetConversationsQuery()

  const totalUnreadCountServer = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  )
  // Use server total since it survives reload. Fallback to redux if empty (optional safety)
  const totalUnreadCount = totalUnreadCountServer || totalUnreadCountRedux

  // Find active conversation object
  const selected = conversations.find(
    (c) => c.conversationId === activeConversationId,
  )

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetConversationMessagesQuery(activeConversationId, {
    skip: !activeConversationId,
  })

  // -- SignalR Integration --
  const { sendSignalRMessage } = useMessageSignalR({
    activeConversationId,
  })

  const [sendMessageApi, { isLoading: isSending }] = useSendMessageMutation()
  const [markConversationAsRead] = useMarkConversationAsReadMutation()

  // Clear unread logic
  const clearUnreadLogic = (convId) => {
    dispatch(clearUnread(convId))
    dispatch(
      conversationsApi.util.updateQueryData(
        "getConversations",
        undefined,
        (draft) => {
          const cachedConv = draft.find((c) => c.conversationId === convId)
          if (cachedConv) {
            cachedConv.unreadCount = 0
          }
        },
      ),
    )

    // Notify server to mark as read
    markConversationAsRead(convId).catch((err) =>
      console.error("Failed to mark conversation as read:", err),
    )
  }

  // Handle conversation selection
  const handleSelectConversation = (conv) => {
    dispatch(setActiveConversation(conv.conversationId))
    clearUnreadLogic(conv.conversationId)
  }

  // Handle programmatically opened conversations
  useEffect(() => {
    if (activeConversationId) {
      clearUnreadLogic(activeConversationId)
    }
  }, [activeConversationId])

  // Handle back to list
  const handleBackToList = () => {
    dispatch(setView("list"))
    dispatch(setActiveConversation(null)) // Optional: clear selection
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversationId) return

    try {
      await sendMessageApi({
        conversationId: activeConversationId,
        messageData: { messageContent: input, messageType: 0 },
      }).unwrap()
      setInput("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="relative flex items-center" ref={widgetRef}>
      <MessageModal isOpen={isOpen}>
        {/* Header */}
        {view === "detail" && selected ? (
          <ConversationDetailHeader
            conversation={selected}
            onBack={handleBackToList}
            onClose={() => dispatch(closeWidget())}
          />
        ) : (
          <ConversationListHeader
            onClose={() => dispatch(closeWidget())}
            isLoading={isLoading}
          />
        )}

        {/* Content Area */}
        {view === "list" ? (
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            isError={isError}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <ConversationDetail
            conversation={selected}
            messages={messages}
            isLoading={messagesLoading}
            input={input}
            onInputChange={(e) => setInput(e.target.value)}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isSending={isSending}
          />
        )}
      </MessageModal>

      <button
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal("login")
            return
          }
          dispatch(toggleWidget())
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors bg-[#F2F2F2] hover:bg-[#D9D9D9] ${isOpen ? "" : ""}`}
        aria-label="Tin nhắn"
      >
        <MessageCircle size={20} />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full border-white bg-red-500 text-[10px] text-white shadow-sm dark:border-gray-800">
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </span>
        )}
      </button>
    </div>
  )
}

export default MessageWidget
