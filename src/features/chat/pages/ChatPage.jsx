import { useState, useCallback, useMemo, useEffect } from "react"
import { MessageCircle, SquarePen, Users, User, X } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import ChatSidebar from "../components/ChatSidebar"
import ChatArea from "../components/ChatArea"
import ChatUserPanel from "../components/ChatUserPanel"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
} from "@/store/api/social/conversationsApi"
import { setActiveChatPageConversation } from "@/store/slices/messageWidgetSlice"
import { useConversationSignalRContext } from "@/features/messages/context/ConversationSignalRContext"
import useMessageSignalR from "@/features/messages/hooks/useMessageSignalR"
import { EmptyState } from "@/shared/components/ui/indicators"
import NewChatModal from "../components/NewChatModal"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"

/**
 * ChatPage — fullscreen chat page.
 *
 * Orchestrates the three-panel layout:
 *   Sidebar (360px) | Chat Area (flex-1) | Info Panel (340px, toggleable)
 */
const ChatPage = () => {
  const dispatch = useDispatch()
  const signalr = useConversationSignalRContext()

  // ── Auth & Profile ─────────────────────────────────────
  const { user: authUser } = useAuth()

  const { data: userProfile } = useGetUserProfileQuery()

  // ── RTK Query Data ─────────────────────────────────────
  const {
    data: conversationsResponse = [],
    isLoading: isLoadingConversations,
  } = useGetConversationsQuery()

  const conversations = useMemo(() => {
    return Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []
  }, [conversationsResponse])

  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Sync active conversation with Redux and join SignalR group on select
  useMessageSignalR({ activeConversationId: selectedId })

  useEffect(() => {
    if (selectedId) {
      dispatch(setActiveChatPageConversation(selectedId))
      if (signalr) {
        signalr.invoke("JoinConversation", Number(selectedId)).catch(() => {
          // Fallback to string if number format is rejected
          signalr
            .invoke("JoinConversation", String(selectedId))
            .catch(console.warn)
        })
      }
    } else {
      dispatch(setActiveChatPageConversation(null))
    }
  }, [selectedId, dispatch, signalr])

  // Clear active conversation on unmount
  useEffect(() => {
    return () => {
      dispatch(setActiveChatPageConversation(null))
    }
  }, [dispatch])

  // Fetch messages for selected conversation
  const { data: activeMessagesResponse = [], isLoading: isLoadingMessages } =
    useGetConversationMessagesQuery(selectedId, { skip: !selectedId })

  const activeMessagesRaw = useMemo(() => {
    return Array.isArray(activeMessagesResponse)
      ? activeMessagesResponse
      : activeMessagesResponse?.data || []
  }, [activeMessagesResponse])

  // Get Friend Status Map from Redux (populated via SignalR)
  const friendOnlineStatus = useSelector(
    (state) => state.notification.friendOnlineStatus,
  )

  // ── New Chat Modal State ──────────────────────────────
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)

  // ── Mutations ──────────────────────────────────────────
  const [sendMessageMutation] = useSendMessageMutation()

  // ── Mappings ───────────────────────────────────────────
  const currentUser = useMemo(() => {
    return {
      id: authUser?.accountId,
      name: userProfile?.username || authUser?.username || "Me",
      avatar: userProfile?.avatarImageUrl || null,
      status: "online",
      about: userProfile?.level || "Student",
    }
  }, [authUser, userProfile])

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

  const activeMessages = useMemo(() => {
    return activeMessagesRaw.map((msg) => ({
      id: msg.messageId,
      senderId: msg.sender?.accountId,
      content: msg.messageContent,
      timestamp: msg.createDate,
      status: msg.isRead ? "read" : "delivered",
      sender: msg.sender,
    }))
  }, [activeMessagesRaw])

  // ── Handlers ───────────────────────────────────────────
  const handleSelectConversation = useCallback((convId) => {
    setSelectedId(convId)
    setInputValue("")
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(null)
    setShowInfoPanel(false)
  }, [])

  const handleToggleInfo = useCallback(() => {
    setShowInfoPanel((prev) => !prev)
  }, [])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !selectedId) return

    try {
      await sendMessageMutation({
        conversationId: selectedId,
        messageData: {
          messageContent: inputValue.trim(),
          messageType: "Text",
        },
      }).unwrap()
      setInputValue("")
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }, [inputValue, selectedId, sendMessageMutation])

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
          isLoading={isLoadingMessages}
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
      <AnimatePresence initial={false}>
        {showInfoPanel && selectedId && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 xl:hidden backdrop-blur-xs"
              onClick={() => setShowInfoPanel(false)}
            />

            {/* Mobile drawer container */}
            <FluentAnimation
              direction="left"
              distance={40}
              exit={true}
              className="fixed right-0 top-0 h-full z-50 shadow-2xl xl:hidden flex max-w-[85vw] overflow-hidden"
            >
              <ChatUserPanel
                conversation={activeConversation}
                currentUser={currentUser}
                onClose={() => setShowInfoPanel(false)}
                friendOnlineStatus={friendOnlineStatus}
                isDrawer={true}
              />
            </FluentAnimation>

            {/* Desktop inline panel */}
            <div className="hidden xl:flex shrink-0">
              <ChatUserPanel
                conversation={activeConversation}
                currentUser={currentUser}
                onClose={() => setShowInfoPanel(false)}
                friendOnlineStatus={friendOnlineStatus}
                isDrawer={false}
              />
            </div>
          </>
        )}
      </AnimatePresence>

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
