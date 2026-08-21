import React, { useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
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
  } = useGlobalVideoCall()

  const [aiReplyTarget, setAiReplyTarget] = React.useState(null)
  const [roomReplyTarget, setRoomReplyTarget] = React.useState(null)

  // Bridge tab state → collapse state so useUnreadTracking works correctly
  useEffect(() => {
    if (activeChatTab === "room") {
      setIsChatCollapsed(false)
      setIsAiCollapsed(true)
    } else {
      setIsChatCollapsed(true)
      setIsAiCollapsed(false)
    }
  }, [activeChatTab, setIsChatCollapsed, setIsAiCollapsed])

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
            />
            <ChatInput
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              isAiInput={true}
              replyTarget={aiReplyTarget}
              onCancelReply={() => setAiReplyTarget(null)}
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
