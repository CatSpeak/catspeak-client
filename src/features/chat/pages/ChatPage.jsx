import { useState, useCallback } from "react"
import { MessageCircle } from "lucide-react"
import ChatSidebar from "../components/ChatSidebar"
import ChatArea from "../components/ChatArea"
import ChatUserPanel from "../components/ChatUserPanel"
import {
  currentUser,
  users,
  conversations as initialConversations,
  messages as initialMessages,
} from "../data/chatMockData"
import "../styles/chat.css"

/**
 * ChatPage — fullscreen chat page.
 *
 * Orchestrates the three-panel layout:
 *   Sidebar (360px) | Chat Area (flex-1) | Info Panel (340px, toggleable)
 *
 * Responsive:
 *   - Desktop (≥1024px): All panels visible
 *   - Tablet (≥768px):   Sidebar + Chat, no info panel
 *   - Mobile (<768px):   Sidebar OR Chat (toggle on selection)
 */
const ChatPage = () => {
  // ── State ──────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState(null)
  const [messagesMap, setMessagesMap] = useState(initialMessages)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Active conversation
  const activeConversation =
    initialConversations.find((c) => c.id === selectedId) || null
  const activeMessages = messagesMap[selectedId] || []

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

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !selectedId) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    setMessagesMap((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage],
    }))
    setInputValue("")

    // Simulate "delivered" after 1s, "read" after 2.5s
    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedId]: prev[selectedId]?.map((m) =>
          m.id === newMessage.id ? { ...m, status: "delivered" } : m,
        ),
      }))
    }, 1000)

    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedId]: prev[selectedId]?.map((m) =>
          m.id === newMessage.id ? { ...m, status: "read" } : m,
        ),
      }))
    }, 2500)
  }, [inputValue, selectedId])

  // ── Empty state (no conversation selected — desktop) ───
  const EmptyState = () => (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-20 h-20 rounded-full bg-[#990011]/5 flex items-center justify-center mb-4">
        <MessageCircle size={36} className="text-[#990011]" strokeWidth={1.5} />
      </div>
      <h2 className="text-[18px] font-semibold text-[#1A1A1A]">
        Your Messages
      </h2>
      <p className="mt-1.5 text-[13px] text-[#9CA0AB] text-center max-w-[260px]">
        Select a conversation from the sidebar to start chatting
      </p>
    </div>
  )

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden bg-white">
      {/* ── Sidebar ──────────────────────────────────── */}
      <div
        className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-auto`}
      >
        <ChatSidebar
          conversations={initialConversations}
          users={users}
          currentUser={currentUser}
          messagesMap={messagesMap}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* ── Chat Area ────────────────────────────────── */}
      {selectedId ? (
        <ChatArea
          conversation={activeConversation}
          messages={activeMessages}
          usersMap={users}
          currentUser={currentUser}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onBack={handleBack}
          onToggleInfo={handleToggleInfo}
          showInfoActive={showInfoPanel}
        />
      ) : (
        <EmptyState />
      )}

      {/* ── Info Panel (desktop only, toggleable) ────── */}
      {showInfoPanel && selectedId && (
        <div className="hidden lg:flex">
          <ChatUserPanel
            conversation={activeConversation}
            usersMap={users}
            currentUser={currentUser}
            onClose={() => setShowInfoPanel(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ChatPage
