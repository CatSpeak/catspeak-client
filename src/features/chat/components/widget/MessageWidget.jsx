import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import AuthModalContext from "@/shared/context/AuthModalContext"
import {
  useGetConversationsQuery,
  useMarkConversationAsReadMutation,
  conversationsApi,
} from "@/store/api/social/conversationsApi"
import useMessageSignalR from "../../hooks/useMessageSignalR"
import useChatMessageActions from "@/features/chat/hooks/useChatMessageActions"
import useChatMessages from "@/features/chat/hooks/useChatMessages"
import useClickOutside from "@/shared/hooks/useClickOutside"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { StackTransition } from "@/shared/components/ui/animations"
import {
  closeWidget,
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
import FileSizeLimitModal from "../modals/FileSizeLimitModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const MessageWidget = () => {
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { user: authUser, isAuthenticated } = useAuth()
  const { data: userProfile } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const { openAuthModal } = useContext(AuthModalContext)
  const { isOpen, activeConversationId, view } = useSelector(
    (state) => state.messageWidget,
  )
  const [input, setInput] = useState("")
  const [slideDirection, setSlideDirection] = useState(1)

  // ── Chat Message Actions Hook ──────────────────────────
  const {
    replyingTo,
    pendingUpload,
    isFileSizeModalOpen,
    closeFileSizeModal,
    handleReply,
    handleCancelReply,
    handleSend: sendAction,
    handleSendVoice,
    handleRetryUpload,
    handleCancelUpload,
    handleDeleteForMe,
    handleRecall,
    handleEditMessage: editMessageAction,
    handleToggleReaction: toggleReactionAction,
    isSending,
  } = useChatMessageActions(activeConversationId)

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
      ignoreSelector:
        "[data-message-widget-portal], [data-popover-portal], [role='dialog']",
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

  // Preserve last valid conversation object so exiting detail screen never loses its header/avatar
  const [cachedConversation, setCachedConversation] = useState(activeConversation)
  if (activeConversation && activeConversation !== cachedConversation) {
    setCachedConversation(activeConversation)
  }
  const displayedConversation = activeConversation || cachedConversation

  // Fetch messages for selected conversation while widget has activeConversationId
  const shouldFetchMessages = Boolean(isOpen && activeConversationId)
  const activeConvIdToFetch = shouldFetchMessages ? activeConversationId : null

  const {
    activeMessages,
    isLoadingMessages: messagesLoading,
    isFetchingOlder,
    hasMoreMessages,
    handleLoadMoreMessages,
    optimisticEditMessage,
    optimisticToggleReaction,
  } = useChatMessages(activeConvIdToFetch)

  // Preserve last non-empty messages so exiting detail screen never flashes empty state
  const [cachedMessages, setCachedMessages] = useState(activeMessages)
  if (
    activeMessages &&
    activeMessages.length > 0 &&
    activeMessages !== cachedMessages
  ) {
    setCachedMessages(activeMessages)
  }
  const displayedMessages =
    activeMessages && activeMessages.length > 0
      ? activeMessages
      : cachedMessages || []

  // -- SignalR Integration --
  const { startTyping, stopTyping, typingUsers } = useMessageSignalR({
    activeConversationId: shouldFetchMessages ? activeConversationId : null,
  })

  const [markConversationAsRead] = useMarkConversationAsReadMutation()

  // Clear unread logic
  const clearUnreadLogic = useCallback(
    (convId) => {
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
    },
    [dispatch, markConversationAsRead],
  )

  // Handle conversation selection
  const handleSelectConversation = (conv) => {
    setSlideDirection(1)
    dispatch(setActiveConversation(conv.conversationId))
    handleCancelReply()
    clearUnreadLogic(conv.conversationId)
  }

  const markedConvIdRef = useRef(null)

  // Handle programmatically opened conversations or updates to active conversation
  useEffect(() => {
    if (!isOpen || view !== "detail" || !activeConversationId) {
      markedConvIdRef.current = null
      return
    }

    const currentCached = conversations.find(
      (c) =>
        Number(c.conversationId ?? c.id) === Number(activeConversationId) ||
        String(c.conversationId ?? c.id) === String(activeConversationId),
    )

    if (
      currentCached &&
      currentCached.unreadCount > 0 &&
      markedConvIdRef.current !== activeConversationId
    ) {
      markedConvIdRef.current = activeConversationId
      clearUnreadLogic(activeConversationId)
    }
  }, [isOpen, view, activeConversationId, conversations, clearUnreadLogic])

  // Handle back to list
  const handleBackToList = () => {
    setSlideDirection(-1)
    dispatch(setView("list"))
    handleCancelReply()
  }

  const handleEditMessage = useCallback(
    async (message, newContent) => {
      const msgId = message?.id || message?.messageId
      if (msgId) optimisticEditMessage(msgId, newContent)
      if (editMessageAction) await editMessageAction(message, newContent)
    },
    [optimisticEditMessage, editMessageAction],
  )

  const handleToggleReaction = useCallback(
    async (message, emoji) => {
      const msgId = message?.id || message?.messageId
      if (msgId) optimisticToggleReaction(msgId, emoji)
      if (toggleReactionAction) await toggleReactionAction(message, emoji)
    },
    [optimisticToggleReaction, toggleReactionAction],
  )

  // Handle send message
  const handleSendMessage = async (text, file) => {
    if (stopTyping) stopTyping()
    await sendAction(text, file)
    setInput("")
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }

  // Filter out empty 1:1 conversations (unless active) and sort by latest timestamp matching ChatSidebar
  const filteredConversations = useMemo(() => {
    let result = [...conversations]

    result = result.filter((c) => {
      if (c.conversationId === activeConversationId) return true
      if (c.isGroup) return true
      return Boolean(c.lastMessage || c.lastMessageType || c.lastMessageTime)
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
        <StackTransition
          activeKey={view}
          direction={slideDirection}
          onExitComplete={() => {
            if (view === "list") {
              dispatch(setActiveConversation(null))
            }
          }}
        >
          {view === "list" ? (
            <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
              <ConversationListHeader
                onClose={() => dispatch(closeWidget())}
                isLoading={isLoading}
              />
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
                to={
                  activeConversationId
                    ? `/chat/${activeConversationId}`
                    : "/chat"
                }
                onClick={() => dispatch(closeWidget())}
                className="h-12 flex items-center justify-center gap-2 border-t border-border px-4 text-sm text-[#990011] hover:bg-[#f3f3f3] transition-colors shrink-0"
              >
                <ExternalLink size={20} />
                {t.messages.seeAllChat}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
              <ConversationDetailHeader
                conversation={displayedConversation}
                onBack={handleBackToList}
                onClose={() => dispatch(closeWidget())}
              />
              <ConversationDetail
                conversation={displayedConversation}
                messages={displayedMessages}
                currentUser={currentUser}
                isLoading={messagesLoading}
                hasMoreMessages={hasMoreMessages}
                isLoadingMore={isFetchingOlder}
                onLoadMoreMessages={handleLoadMoreMessages}
                input={input}
                onInputChange={(e) => {
                  const val =
                    typeof e === "string" ? e : (e?.target?.value ?? "")
                  setInput(val)
                  if (val.trim().length > 0) {
                    if (startTyping) startTyping()
                  } else {
                    if (stopTyping) stopTyping()
                  }
                }}
                onSendMessage={handleSendMessage}
                onSendVoice={handleSendVoice}
                onKeyPress={handleKeyPress}
                isSending={isSending}
                typingUsers={typingUsers}
                onStartTyping={startTyping}
                onStopTyping={stopTyping}
                replyingTo={replyingTo}
                onReply={handleReply}
                onCancelReply={handleCancelReply}
                onDeleteForMe={handleDeleteForMe}
                onRecall={handleRecall}
                onEdit={handleEditMessage}
                onToggleReaction={handleToggleReaction}
                pendingUpload={pendingUpload}
                onRetryUpload={handleRetryUpload}
                onCancelUpload={handleCancelUpload}
              />
            </div>
          )}
        </StackTransition>
      </MessageModal>

      <IconButton
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal("login")
            return
          }
          dispatch(toggleWidget())
        }}
        variant="filled"
        aria-label="Tin nhắn"
        badge={
          totalUnreadCount > 0 && (
            <span className="absolute top-0 right-0 z-10 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold leading-none text-white shadow-xs pointer-events-none dark:border-gray-800">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )
        }
      >
        <MessageCircle />
      </IconButton>

      {/* ── File Size Limit Modal ────────────────────── */}
      <FileSizeLimitModal
        open={isFileSizeModalOpen}
        onClose={closeFileSizeModal}
      />
    </div>
  )
}

export default MessageWidget
