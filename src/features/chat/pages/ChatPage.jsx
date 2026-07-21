import { useState, useCallback, useMemo, useEffect } from "react"
import { MessageCircle } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import ChatSidebar from "../components/ChatSidebar"
import ChatArea from "../components/ChatArea"
import ChatUserPanel from "../components/ChatUserPanel"
import NewChatModal from "../components/modals/NewChatModal"
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

/**
 * ChatPage — fullscreen chat page.
 *
 * Orchestrates the three-panel layout:
 *   Sidebar (360px) | Chat Area (flex-1) | Info Panel (340px, toggleable)
 */
const ChatPage = () => {
  const dispatch = useDispatch()
  const isDesktop = useMediaQuery("(min-width: 1280px)")

  // ── Auth & Profile ─────────────────────────────────────
  const { user: authUser } = useAuth()
  const { data: userProfile } = useGetUserProfileQuery()

  // ── UI State ───────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  // ── Chat Custom Hooks ──────────────────────────────────
  const {
    activeMessages,
    accumulatedMessagesCount,
    isLoadingMessages,
    isFetchingMessages,
    hasMoreMessages,
    handleLoadMoreMessages,
    page,
  } = useChatMessages(selectedId)

  const { conversations, activeConversation, isLoadingConversations } =
    useChatConversations(selectedId, accumulatedMessagesCount)

  const {
    replyingTo,
    handleReply,
    handleCancelReply,
    handleSend: sendAction,
    handleDeleteForMe,
    handleRecall,
  } = useChatMessageActions(selectedId)

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
      name: userProfile?.username || authUser?.username || "Me",
      avatar: userProfile?.avatarImageUrl || null,
      status: "online",
      about: userProfile?.level || "Student",
    }
  }, [authUser, userProfile])

  // ── Handlers ───────────────────────────────────────────
  const handleSelectConversation = useCallback(
    (convId) => {
      setSelectedId(convId)
      setInputValue("")
      handleCancelReply()
    },
    [handleCancelReply],
  )

  const handleBack = useCallback(() => {
    setSelectedId(null)
    setShowInfoPanel(false)
    handleCancelReply()
  }, [handleCancelReply])

  const handleToggleInfo = useCallback(() => {
    setShowInfoPanel((prev) => !prev)
  }, [])

  const handleLeaveGroup = useCallback(() => {
    setSelectedId(null)
    setShowInfoPanel(false)
    handleCancelReply()
    dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
  }, [dispatch, handleCancelReply])

  const handleSend = useCallback(
    async (text, file) => {
      await sendAction(text, file)
      setInputValue("")
    },
    [sendAction],
  )

  return (
    <div className="flex lg:gap-4 lg:p-4 h-[calc(100dvh-64px)] overflow-hidden bg-primary2">
      {/* ── Sidebar ──────────────────────────────────── */}
      <div
        className={`${selectedId ? "hidden lg:flex" : "flex"} w-full lg:w-fit shrink-0`}
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
          onBack={handleBack}
          onToggleInfo={handleToggleInfo}
          showInfoActive={showInfoPanel}
          friendOnlineStatus={friendOnlineStatus}
          isLoading={isLoadingMessages && page === 1}
          isLoadingMore={isFetchingMessages && page > 1}
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
        />
      ) : (
        <EmptyState
          variant="detailed"
          className="flex-1 hidden lg:flex"
          message={
            <div className="flex flex-col items-center justify-center">
              <MessageCircle size={48} className="text-[#990011] mb-4" />
              <h2 className="text-lg font-semibold text-black mb-1">
                Your Messages
              </h2>
              <p className="text-sm text-[#606060] text-center max-w-[260px]">
                Select a conversation from the sidebar to start chatting
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
            <div className="fixed right-0 top-0 h-full z-50 shadow-2xl xl:hidden flex max-w-[85vw] overflow-hidden">
              <ChatUserPanel
                conversation={activeConversation}
                currentUser={currentUser}
                onClose={() => setShowInfoPanel(false)}
                onLeaveGroup={handleLeaveGroup}
                friendOnlineStatus={friendOnlineStatus}
                isDrawer={true}
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
    </div>
  )
}

export default ChatPage
