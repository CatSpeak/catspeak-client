import React, { useState, useRef, useEffect, useContext, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import AuthModalContext from "@/shared/context/AuthModalContext"
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  conversationsApi,
} from "@/store/api/social/conversationsApi"
import useMessageSignalR from "../../hooks/useMessageSignalR"
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
import { MessageCircle, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import MessageModal from "./MessageModal"
import ConversationListHeader from "./ConversationListHeader"
import ConversationDetailHeader from "./ConversationDetailHeader"
import ConversationList from "./ConversationList"
import ConversationDetail from "./ConversationDetail"

const MessageWidget = () => {
  const dispatch = useDispatch()
  const { user: authUser, isAuthenticated } = useAuth()
  const { data: userProfile } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const { openAuthModal } = useContext(AuthModalContext)
  const { isOpen, activeConversationId, view } = useSelector(
    (state) => state.messageWidget,
  )
  const [input, setInput] = useState("")
  const totalUnreadCountRedux = useSelector(selectTotalUnread)
  const friendOnlineStatus = useSelector(
    (state) => state.notification?.friendOnlineStatus || {},
  )
  const widgetRef = useRef(null)

  const currentUser = useMemo(() => {
    return {
      id: authUser?.accountId,
      name: userProfile?.username || authUser?.username || "Me",
      avatar: userProfile?.avatarImageUrl || null,
    }
  }, [authUser, userProfile])

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
  } = useGetConversationsQuery(undefined, { skip: !isAuthenticated })

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

  const activeConversation = useMemo(() => {
    if (!selected) return null
    return {
      id: selected.conversationId,
      type: selected.isGroup ? "group" : "direct",
      name: selected.isGroup
        ? selected.groupName
        : selected.friend?.username || "Chat",
      participants: selected.participants || [],
      unreadCount: selected.unreadCount || 0,
      friend: selected.friend,
      isGroup: selected.isGroup,
      groupName: selected.groupName,
      groupAvatar: selected.groupAvatar,
    }
  }, [selected])

  // Fetch messages for selected conversation
  const { data: messagesResponse = [], isLoading: messagesLoading } =
    useGetConversationMessagesQuery(activeConversationId, {
      skip: !activeConversationId,
    })

  const activeMessages = useMemo(() => {
    const rawList = Array.isArray(messagesResponse)
      ? messagesResponse
      : messagesResponse?.data || []
    return rawList.map((msg) => ({
      id: msg.messageId,
      conversationId: msg.conversationId,
      senderId: msg.sender?.accountId,
      content: msg.messageContent,
      timestamp: msg.createDate,
      messageType: msg.messageType || "Text",
      isRead: msg.isRead ?? false,
      status: msg.isRead ? "read" : "delivered",
      readByAccountIds: msg.readByAccountIds || [],
      sender: msg.sender,
    }))
  }, [messagesResponse])

  // -- SignalR Integration --
  const { startTyping, stopTyping, typingUsers } = useMessageSignalR({
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

  // Handle programmatically opened conversations or updates to active conversation
  useEffect(() => {
    if (!activeConversationId) return

    const currentCached = conversations.find(
      (c) =>
        Number(c.conversationId ?? c.id) === Number(activeConversationId) ||
        String(c.conversationId ?? c.id) === String(activeConversationId),
    )

    if (!currentCached || currentCached.unreadCount > 0) {
      clearUnreadLogic(activeConversationId)
    }
  }, [activeConversationId, conversations])

  // Handle back to list
  const handleBackToList = () => {
    dispatch(setView("list"))
    dispatch(setActiveConversation(null)) // Optional: clear selection
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversationId) return

    if (stopTyping) stopTyping()
    try {
      await sendMessageApi({
        conversationId: activeConversationId,
        messageData: { messageContent: input, messageType: "Text" },
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

  // Filter out empty 1:1 conversations (unless active) and sort by latest timestamp matching ChatSidebar
  const filteredConversations = useMemo(() => {
    let result = [...conversations]

    result = result.filter((c) => {
      if (c.conversationId === activeConversationId) return true
      if (c.isGroup) return true
      return !!c.lastMessage
    })

    result.sort((a, b) => {
      const aTime = a.lastMessageTime || a.createDate || ""
      const bTime = b.lastMessageTime || b.createDate || ""
      return new Date(bTime) - new Date(aTime)
    })

    return result
  }, [conversations, activeConversationId])

  return (
    <div className="relative flex items-center" ref={widgetRef}>
      <MessageModal isOpen={isOpen}>
        {/* Header */}
        {view === "detail" && selected ? (
          <ConversationDetailHeader
            conversation={activeConversation || selected}
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
          <>
            <ConversationList
              conversations={filteredConversations}
              currentUser={currentUser}
              friendOnlineStatus={friendOnlineStatus}
              isLoading={isLoading}
              isError={isError}
              onSelectConversation={handleSelectConversation}
            />
            {/* Link to full chat page */}
            <Link
              to="/chat"
              onClick={() => dispatch(closeWidget())}
              className="h-12 flex items-center justify-center gap-2 border-t border-[#e5e5e5] px-4 text-sm text-[#990011] hover:bg-[#F8F8F8] transition-colors shrink-0"
            >
              <ExternalLink size={20} />
              See all in Chat
            </Link>
          </>
        ) : (
          <ConversationDetail
            conversation={activeConversation}
            messages={activeMessages}
            currentUser={currentUser}
            isLoading={messagesLoading}
            input={input}
            onInputChange={(e) => {
              const val = e.target.value
              setInput(val)
              if (val.trim().length > 0) {
                if (startTyping) startTyping()
              } else {
                if (stopTyping) stopTyping()
              }
            }}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isSending={isSending}
            typingUsers={typingUsers}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
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
