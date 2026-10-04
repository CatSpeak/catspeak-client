import { useState, useCallback, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import ChatSidebar from "../components/ChatSidebar"
import ChatArea from "../components/ChatArea"
import ChatUserPanel from "../components/ChatUserPanel"
import NewChatModal from "../components/modals/NewChatModal"
import FileSizeLimitModal from "../components/modals/FileSizeLimitModal"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { conversationsApi } from "@/store/api/social/conversationsApi"
import { setActiveChatPageConversation } from "@/store/slices/messageWidgetSlice"
import useMessageSignalR from "@/features/chat/hooks/useMessageSignalR"
import useChatMessageActions from "@/features/chat/hooks/useChatMessageActions"
import useChatMessages from "@/features/chat/hooks/useChatMessages"
import useChatConversations from "@/features/chat/hooks/useChatConversations"
import { EmptyState } from "@/shared/components/ui/indicators"
import useMediaQuery from "@/shared/hooks/useMediaQuery"
import { useLanguage } from "@/shared/context/LanguageContext"
import { FluentAnimation } from "@/shared/components/ui/animations"
import toast from "react-hot-toast"

/**
 * ChatPage — fullscreen chat page.
 *
 * Orchestrates the three-panel layout:
 *   Sidebar (360px) | Chat Area (flex-1) | Info Panel (340px, toggleable)
 */
const ChatPage = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id: routeId } = useParams()
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  // ── Auth & Profile ─────────────────────────────────────
  const { user: authUser } = useAuth()
  const { data: userProfile } = useGetUserProfileQuery()

  // ── Route & Selection State ─────────────────────────────
  const selectedId = routeId || null

  // ── UI State ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("")
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [infoPanelView, setInfoPanelView] = useState("main")
  const [inputValue, setInputValue] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  // ── Chat Custom Hooks ──────────────────────────────────
  const {
    activeMessages,
    accumulatedMessagesCount,
    isLoadingMessages,
    isFetchingOlder,
    hasMoreMessages,
    handleLoadMoreMessages,
    optimisticEditMessage,
    optimisticToggleReaction,
  } = useChatMessages(selectedId)

  const { conversations, activeConversation, isLoadingConversations } =
    useChatConversations(selectedId, accumulatedMessagesCount)

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
    handlePinMessage,
    handleUnpinMessage,
  } = useChatMessageActions(selectedId)

  const handleEditMessage = useCallback(
    async (message, newContent) => {
      const msgId = message?.id || message?.messageId
      if (msgId) optimisticEditMessage(msgId, newContent)
      await editMessageAction(message, newContent)
    },
    [optimisticEditMessage, editMessageAction],
  )

  const handleToggleReaction = useCallback(
    async (message, emoji) => {
      const msgId = message?.id || message?.messageId
      if (msgId) optimisticToggleReaction(msgId, emoji)
      await toggleReactionAction(message, emoji)
    },
    [optimisticToggleReaction, toggleReactionAction],
  )

  const { startTyping, stopTyping, typingUsers } = useMessageSignalR({
    activeConversationId: selectedId,
  })

  // Get Friend Status Map from Redux
  const friendOnlineStatus = useSelector(
    (state) => state.notification.friendOnlineStatus,
  )

  // ── Sync Active Conversation with Redux ────────────────
  useEffect(() => {
    dispatch(setActiveChatPageConversation(selectedId || null))
    return () => {
      dispatch(setActiveChatPageConversation(null))
    }
  }, [selectedId, dispatch])

  // ── Current User Formatting ────────────────────────────
  const currentUser = useMemo(() => {
    return {
      id: authUser?.accountId,
      name: userProfile?.username || authUser?.username || t?.chat?.me || "Me",
      avatar: userProfile?.avatarImageUrl || authUser?.avatarImageUrl || null,
      status: "online",
      about: userProfile?.level || t?.chat?.userPanel?.student || "Student",
    }
  }, [authUser, userProfile, t])

  // ── Handlers ───────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (convId) => {
      navigate(`/chat/${convId}`)
      setInputValue("")
      setInfoPanelView("main")
      handleCancelReply()
    },
    [navigate, handleCancelReply],
  )

  const handleBack = useCallback(() => {
    navigate("/chat")
    setShowInfoPanel(false)
    setInfoPanelView("main")
    handleCancelReply()
  }, [navigate, handleCancelReply])

  const handleToggleInfo = useCallback(() => {
    setShowInfoPanel((prev) => {
      if (prev && infoPanelView === "main") {
        return false
      }
      setInfoPanelView("main")
      return true
    })
  }, [infoPanelView])

  const handleToggleSearch = useCallback(() => {
    setShowInfoPanel((prev) => {
      if (prev && infoPanelView === "search") {
        return false
      }
      setInfoPanelView("search")
      return true
    })
  }, [infoPanelView])

  const handleJumpToMessage = useCallback(
    (messageId) => {
      const element = document.getElementById(`chat-message-${messageId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("chat-message-highlight")
        setTimeout(() => {
          element.classList.remove("chat-message-highlight")
        }, 2000)
      } else {
        toast(
          t?.chat?.olderMessagePrompt ||
            "The message is older. Scroll up to load older messages.",
          {
            icon: "📌",
          },
        )
      }
    },
    [t],
  )

  const handleLeaveGroup = useCallback(() => {
    navigate("/chat")
    setShowInfoPanel(false)
    handleCancelReply()
    dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
  }, [navigate, dispatch, handleCancelReply])

  const handleSend = useCallback(
    async (text, file, extraOptions) => {
      await sendAction(text, file, extraOptions)
      setInputValue("")
    },
    [sendAction],
  )

  return (
    <FluentAnimation className="flex lg:gap-4 lg:p-4 h-[calc(100dvh-64px)] overflow-hidden bg-primary2">
      {/* ── Sidebar ──────────────────────────────────── */}
      <div
        className={`${selectedId ? "hidden lg:flex" : "flex"} w-full lg:w-[360px] shrink-0`}
      >
        <ChatSidebar
          conversations={conversations}
          currentUser={currentUser}
          friendOnlineStatus={friendOnlineStatus}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewChatClick={() => setIsNewChatOpen(true)}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* ── Chat Area ────────────────────────────────── */}
      {selectedId ? (
        <ChatArea
          conversation={activeConversation}
          messages={activeMessages}
          currentUser={currentUser}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onSendVoice={handleSendVoice}
          onBack={handleBack}
          onToggleInfo={handleToggleInfo}
          onToggleSearch={handleToggleSearch}
          isSearchOpen={showInfoPanel && infoPanelView === "search"}
          showInfoActive={showInfoPanel}
          friendOnlineStatus={friendOnlineStatus}
          isLoading={isLoadingMessages}
          isLoadingMore={isFetchingOlder}
          hasMoreMessages={hasMoreMessages}
          onLoadMoreMessages={handleLoadMoreMessages}
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
          onPin={handlePinMessage}
          onUnpin={handleUnpinMessage}
          pendingUpload={pendingUpload}
          onRetryUpload={handleRetryUpload}
          onCancelUpload={handleCancelUpload}
        />
      ) : (
        <EmptyState
          variant="detailed"
          className="flex-1 hidden lg:flex"
          message={
            <div className="flex flex-col items-center justify-center">
              <MessageCircle size={48} className="text-[#990011] mb-4" />
              <h2 className="text-lg font-semibold text-black mb-1">
                {t?.chat?.yourMessages || "Your Messages"}
              </h2>
              <p className="text-sm text-[#606060] text-center max-w-[260px]">
                {t?.chat?.selectConversationPrompt ||
                  "Select a conversation from the sidebar to start chatting"}
              </p>
            </div>
          }
        />
      )}

      {/* ── Info Panel (desktop inline, mobile drawer overlay) ── */}
      {showInfoPanel &&
        selectedId &&
        (isDesktop ? (
          /* Desktop inline panel */
          <div className="hidden xl:flex shrink-0">
            <ChatUserPanel
              conversation={activeConversation}
              currentUser={currentUser}
              onClose={() => setShowInfoPanel(false)}
              onLeaveGroup={handleLeaveGroup}
              friendOnlineStatus={friendOnlineStatus}
              isDrawer={false}
              initialView={infoPanelView}
              onJumpToMessage={handleJumpToMessage}
            />
          </div>
        ) : (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40 xl:hidden backdrop-blur-xs"
              onClick={() => setShowInfoPanel(false)}
            />

            {/* Mobile drawer container */}
            <div className="fixed right-0 top-0 h-full z-50 shadow-2xl xl:hidden flex w-full max-w-full sm:w-[360px] sm:max-w-[360px] overflow-hidden">
              <ChatUserPanel
                conversation={activeConversation}
                currentUser={currentUser}
                onClose={() => setShowInfoPanel(false)}
                onLeaveGroup={handleLeaveGroup}
                friendOnlineStatus={friendOnlineStatus}
                isDrawer={true}
                initialView={infoPanelView}
                onJumpToMessage={handleJumpToMessage}
              />
            </div>
          </>
        ))}

      {/* ── New Chat Modal ───────────────────────────── */}
      <NewChatModal
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onConversationCreated={handleSelectConversation}
      />

      {/* ── File Size Limit Modal ────────────────────── */}
      <FileSizeLimitModal
        open={isFileSizeModalOpen}
        onClose={closeFileSizeModal}
      />
    </FluentAnimation>
  )
}

export default ChatPage
