import React, { useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useAiSend } from "@/features/video-call/hooks/useAiSend"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"
import Tabs from "@/shared/components/ui/navigation/Tabs"

const ChatBox = ({ messages, onSendMessage, isConnected, className = "" }) => {
  const { t } = useLanguage()
  const {
    aiMessages = [],
    setIsChatCollapsed,
    setIsAiCollapsed,
    unreadRoomChat,
    unreadAiChat,
    activeChatTab,
    setActiveChatTab,
    room,
    triggerStarterGreeting,
    loadMoreMeetingSuggestions,
  } = useGlobalVideoCall()

  const { sendAiMessage } = useAiSend()
  const [aiReplyTarget, setAiReplyTarget] = useState(null)
  const [roomReplyTarget, setRoomReplyTarget] = useState(null)
  const [isUserTyping, setIsUserTyping] = useState(false)

  const roomTopic =
    room?.topic ||
    (Array.isArray(room?.topics) && room?.topics.length > 0 ? room?.topics[0] : null)
  const roomLanguage = room?.languageType || room?.language || "en"

  // Bridge tab state → collapse state so useUnreadTracking works correctly
  useEffect(() => {
    if (activeChatTab === "room") {
      setIsChatCollapsed(false)
      setIsAiCollapsed(true)
    } else {
      setIsChatCollapsed(true)
      setIsAiCollapsed(false)
      // FR-001, BR-004: Trigger starter greeting once per session when opening AI tab
      if (typeof triggerStarterGreeting === "function") {
        triggerStarterGreeting(roomTopic, roomLanguage)
      }
    }
  }, [
    activeChatTab,
    setIsChatCollapsed,
    setIsAiCollapsed,
    triggerStarterGreeting,
    roomTopic,
    roomLanguage,
  ])

  const roomLabel = t.rooms?.chatBox?.title || "Tin nhắn phòng"
  const aiLabel = t.rooms?.chatBox?.aiAssistant || "Trợ lý Cat Speak"

  const chatTabs = [
    {
      id: "room",
      label: `${roomLabel} (${messages?.length || 0})`,
      badge:
        activeChatTab !== "room" && unreadRoomChat > 0
          ? unreadRoomChat > 9
            ? "9+"
            : unreadRoomChat
          : null,
    },
    {
      id: "ai",
      label: `${aiLabel} (${aiMessages?.length || 0})`,
      badge:
        activeChatTab !== "ai" && unreadAiChat > 0
          ? unreadAiChat > 9
            ? "9+"
            : unreadAiChat
          : null,
    },
  ]

  // Handler to auto-send a suggested sentence into the meeting room chat (FR-001)
  const handleSendSuggestedSentence = (sentenceText) => {
    if (!sentenceText) return
    onSendMessage(sentenceText)
  }

  // Handler to load more suggestions from dataset (FR-007)
  const handleLoadMoreSuggestions = () => {
    if (typeof loadMoreMeetingSuggestions === "function") {
      loadMoreMeetingSuggestions(roomTopic, roomLanguage)
    }
  }

  // Handler when user clicks a follow-up question button (FR-002, FR-005)
  const handleSelectFollowUp = (questionText) => {
    if (!questionText) return
    sendAiMessage(questionText, { isPrivateAi: true })
  }

  // Handler to retry a failed AI prompt (E-003)
  const handleRetryAi = (promptText) => {
    if (!promptText) return
    sendAiMessage(promptText, { isPrivateAi: true })
  }

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      {/* Tab Bar */}
      <Tabs
        tabs={chatTabs}
        activeTab={activeChatTab}
        onChange={setActiveChatTab}
        fullWidth={true}
        className="shrink-0"
      />

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* AI Tab Content */}
        {activeChatTab === "ai" && (
          <>
            <MessageList
              messages={aiMessages}
              t={t}
              emptyText={
                t.rooms?.chatBox?.aiEmptyText ||
                "Ask the AI by typing @public-ai or @private-ai in the chat."
              }
              onReplyTo={(msg) => setAiReplyTarget(msg)}
              onSendSuggestedSentence={handleSendSuggestedSentence}
              onLoadMoreSuggestions={handleLoadMoreSuggestions}
              onSelectFollowUp={handleSelectFollowUp}
              onRetryAi={handleRetryAi}
              isUserTyping={isUserTyping}
            />
            <ChatInput
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              isAiInput={true}
              replyTarget={aiReplyTarget}
              onCancelReply={() => setAiReplyTarget(null)}
              onTypingChange={setIsUserTyping}
            />
          </>
        )}

        {/* Room Chat Tab Content */}
        {activeChatTab === "room" && (
          <>
            <MessageList
              messages={messages}
              t={t}
              emptyText={t.rooms?.chatBox?.empty || "No messages yet"}
              onReplyTo={(msg) => setRoomReplyTarget(msg)}
            />
            <ChatInput
              onSendMessage={(text) => {
                onSendMessage(text, roomReplyTarget)
                setRoomReplyTarget(null)
              }}
              isConnected={isConnected}
              replyTarget={roomReplyTarget}
              onCancelReply={() => setRoomReplyTarget(null)}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ChatBox
