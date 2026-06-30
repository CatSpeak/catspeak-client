import React, { useState, useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"

const ChatBox = ({
  messages,
  currentUser,
  onSendMessage,
  isConnected,
  className = "",
  hideTitle,
}) => {
  const { t } = useLanguage()
  const {
    aiMessages = [],
    unreadRoomChat,
    unreadAiChat,
    setIsAiCollapsed,
  } = useGlobalVideoCall()

  // Tab state: "room" | "ai"
  const [activeTab, setActiveTab] = useState("room")
  const [aiReplyTarget, setAiReplyTarget] = useState(null)
  const [roomReplyTarget, setRoomReplyTarget] = useState(null)

  // Reset reply targets when switching tabs
  useEffect(() => {
    setAiReplyTarget(null)
    setRoomReplyTarget(null)
  }, [activeTab])

  return (
    <div className={`relative flex h-full flex-col bg-[#FCFCFC] ${className}`}>
      {/* Tab Switcher — Pill Style */}
      <div className="flex items-center justify-center px-2.5 py-1.5 shrink-0">
        <div className="flex items-center gap-5 bg-[#F5F5F5] rounded-[55px] px-2.5 py-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("room")}
            className={`flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-200 text-sm font-bold whitespace-nowrap ${
              activeTab === "room"
                ? "bg-cath-red-700 text-white shadow-sm"
                : "text-[#7B7979] font-semibold hover:text-[#1a1a1a]"
            }`}
          >
            {t.rooms?.chatBox?.title || "Tin nhắn phòng"}
            {unreadRoomChat > 0 && activeTab !== "room" && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadRoomChat > 9 ? "9+" : unreadRoomChat}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap ${
              activeTab === "ai"
                ? "bg-cath-red-700 text-white shadow-sm"
                : "text-[#7B7979] font-semibold hover:text-[#1a1a1a]"
            }`}
          >
            {t.rooms?.chatBox?.aiAssistant || "Trợ lý Cat Speak"}
            {unreadAiChat > 0 && activeTab !== "ai" && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadAiChat > 9 ? "9+" : unreadAiChat}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-[0_0_2px_1px_rgba(12,12,13,0.1),0_0_2px_1px_rgba(12,12,13,0.05)] mx-1.5 mb-1.5 overflow-hidden">
        {activeTab === "room" ? (
          <>
            {/* Room Chat Header */}
            <div className="flex items-center h-[46px] px-3 border-b border-[#FFDADE] shrink-0">
              <h3 className="text-sm font-medium text-black m-0 leading-[1.4]">
                {t.rooms?.chatBox?.title || "Tin nhắn phòng"}
              </h3>
            </div>
            {/* Room Messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <MessageList
                messages={messages}
                t={t}
                emptyText={t.rooms?.chatBox?.empty || "No messages yet"}
                onReplyTo={(msg) => setRoomReplyTarget(msg)}
              />
            </div>
            {/* Room Chat Input */}
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
        ) : (
          <>
            {/* AI Chat Header */}
            <div className="flex items-center h-[46px] px-3 border-b border-[#FFDADE] shrink-0">
              <h3 className="text-sm font-medium text-black m-0 leading-[1.4]">
                {t.rooms?.chatBox?.aiAssistant || "Trợ lý Cat Speak"}
              </h3>
            </div>
            {/* AI Messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <MessageList
                messages={aiMessages}
                t={t}
                emptyText={
                  t.rooms?.chatBox?.aiEmptyText ||
                  "Ask the AI by typing @public-ai or @private-ai in the chat."
                }
                onReplyTo={(msg) => setAiReplyTarget(msg)}
              />
            </div>
            {/* AI Chat Input */}
            <ChatInput
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              onAiMessageSent={() => setIsAiCollapsed(false)}
              isAiInput={true}
              replyTarget={aiReplyTarget}
              onCancelReply={() => setAiReplyTarget(null)}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default ChatBox
