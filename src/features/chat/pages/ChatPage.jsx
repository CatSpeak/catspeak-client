import { useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { useParams, useNavigate } from "react-router-dom"
import { MessageCircle } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { motion as Motion, AnimatePresence } from "framer-motion"
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

/**
 * ChatPage — fullscreen chat page.
 *
 * Orchestrates the three-panel layout:
 *   Sidebar (360px) | Chat Area (flex-1) | Info Panel (360px, toggleable inline or drawer)
 */
const ChatPage = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id: routeId } = useParams()
  // Wide screen breakpoint: only show 3 inline columns when >= 1440px to prevent crushing ChatArea
  const isWideScreen = useMediaQuery("(min-width: 1440px)")

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
    isFetchingNewer,
    hasMoreMessages,
    hasMoreAfter,
    isViewingAroundWindow,
    targetHighlightId,
    jumpToMessage,
    clearTargetHighlight,
    handleLoadMoreMessages,
    handleLoadNewerMessages,
    resetToLatest,
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
    handleSendVoice: sendVoiceAction,
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
    const profile = userProfile?.data
    return {
      id: authUser?.accountId,
      sourceAccountId: authUser?.sourceAccountId ?? profile?.sourceAccountId ?? null,
      name: profile?.username || authUser?.username || t?.chat?.me || "Me",
      avatar: profile?.avatarImageUrl || authUser?.avatarImageUrl || null,
      status: "online",
      about: profile?.level || t?.chat?.userPanel?.student || "Student",
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
      jumpToMessage(messageId)
    },
    [jumpToMessage],
  )

  const handleLeaveGroup = useCallback(() => {
    navigate("/chat")
    setShowInfoPanel(false)
    handleCancelReply()
    dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
  }, [navigate, dispatch, handleCancelReply])

  // Close drawer on Escape key when open in drawer mode
  useEffect(() => {
    if (!showInfoPanel || isWideScreen) return
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowInfoPanel(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showInfoPanel, isWideScreen])

  const handleSend = useCallback(
    async (text, file, extraOptions) => {
      setInputValue("")
      if (hasMoreAfter || isViewingAroundWindow) {
        resetToLatest()
      }
      return sendAction(text, file, extraOptions)
    },
    [hasMoreAfter, isViewingAroundWindow, resetToLatest, sendAction],
  )

  const handleSendVoice = useCallback(
    async (file, duration) => {
      if (hasMoreAfter || isViewingAroundWindow) {
        resetToLatest()
      }
      return sendVoiceAction(file, duration)
    },
    [hasMoreAfter, isViewingAroundWindow, resetToLatest, sendVoiceAction],
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
          conversationId={selectedId}
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
          isLoadingNewer={isFetchingNewer}
          hasMoreMessages={hasMoreMessages}
          hasMoreAfter={hasMoreAfter}
          isViewingAroundWindow={isViewingAroundWindow}
          onLoadMoreMessages={handleLoadMoreMessages}
          onLoadNewerMessages={handleLoadNewerMessages}
          onResetToLatest={resetToLatest}
          targetHighlightId={targetHighlightId}
          clearTargetHighlight={clearTargetHighlight}
          onJumpToMessage={handleJumpToMessage}
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

      {/* ── Info Panel (desktop inline on extra-wide screens) ── */}
      {showInfoPanel && selectedId && isWideScreen && (
        <div className="flex shrink-0 h-full">
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
      )}

      {/* ── Info Panel Drawer (slide-over overlay on laptops, tablets, mobile) ── */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showInfoPanel && selectedId && !isWideScreen && (
              <div className="fixed inset-0 z-[100] flex justify-end">
                {/* Backdrop */}
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                  onClick={() => setShowInfoPanel(false)}
                />

                {/* Drawer Container */}
                <Motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="relative z-10 h-full w-full max-w-full sm:w-[360px] sm:max-w-[360px] shadow-2xl bg-white overflow-hidden flex flex-col"
                >
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
                </Motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

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
