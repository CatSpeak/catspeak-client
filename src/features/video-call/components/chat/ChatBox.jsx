import React, { useState, useEffect } from "react"
import {
  Settings,
  Sparkles,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import Popover from "@/shared/components/ui/Popover"
import Switch from "@/shared/components/ui/inputs/Switch"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"
import { PillButton } from "@/shared/components/ui/buttons"

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
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    isChatCollapsed,
    setIsChatCollapsed,
    isAiCollapsed,
    setIsAiCollapsed,
    unreadRoomChat,
    unreadAiChat,
  } = useGlobalVideoCall()

  const [activeTab, setActiveTab] = useState("ai") // "room" | "ai"
  const [aiReplyTarget, setAiReplyTarget] = useState(null)
  const [roomReplyTarget, setRoomReplyTarget] = useState(null)

  // Bridge tab state → collapse state so useUnreadTracking works correctly
  useEffect(() => {
    if (activeTab === "room") {
      setIsChatCollapsed(false)
      setIsAiCollapsed(true)
    } else {
      setIsChatCollapsed(true)
      setIsAiCollapsed(false)
    }
  }, [activeTab, setIsChatCollapsed, setIsAiCollapsed])

  const settingsPopoverContent = (
    <div className="bg-white rounded-lg shadow-lg border border-[#E5E5E5] p-3 w-max">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm whitespace-nowrap">
          {t.rooms?.chatBox?.showSystemMessages ||
            "Show Cat Speak suggestion messages"}
        </span>
        <Switch
          checked={receiveSystemMsgs}
          onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
          colorClass="peer-checked:bg-green-500"
        />
      </div>
    </div>
  )

  const settingsPopover = (
    <Popover
      trigger={
        <Settings
          size={18}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        />
      }
      content={settingsPopoverContent}
      placement="bottom-right"
    />
  )

  const roomLabel = t.rooms?.chatBox?.title || "Tin nhắn phòng"
  const aiLabel = t.rooms?.chatBox?.aiAssistant || "Trợ lý Cat Speak"

  const roomCount = messages?.length || 0
  const aiCount = aiMessages?.length || 0

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      {/* Tab Bar */}
      <div className="flex items-center justify-center shrink-0">
        <div className="flex items-center justify-center gap-5 md:gap-2 md:bg-transparent rounded-xl px-2.5 py-1.5 bg-[#F5F5F5]">
          {/* Room Chat Tab */}
          <PillButton
            onClick={() => setActiveTab("room")}
            variant={activeTab === "room" ? "primary" : "secondary-no-outline"}
          >
            {roomLabel}
            <span className={activeTab === "room" ? "text-white" : "text-[#999]"}>
              ({roomCount})
            </span>
            {activeTab !== "room" && unreadRoomChat > 0 && (
              <span className="ml-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {unreadRoomChat > 9 ? "9+" : unreadRoomChat}
              </span>
            )}
          </PillButton>

          {/* AI Chat Tab */}
          <PillButton
            onClick={() => setActiveTab("ai")}
            variant={activeTab === "ai" ? "primary" : "secondary-no-outline"}
          >
            {aiLabel}
            <span className={activeTab === "ai" ? "text-white" : "text-[#999]"}>
              ({aiCount})
            </span>
            {activeTab !== "ai" && unreadAiChat > 0 && (
              <span className="ml-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                {unreadAiChat > 9 ? "9+" : unreadAiChat}
              </span>
            )}
          </PillButton>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0 border m-2 rounded-xl">
        {/* AI Tab Content */}
        {activeTab === "ai" && (
          <>
            < div className="flex items-center justify-between px-4 py-2 border-b border-[#FFDADE] shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-cath-red-700/10">
                  <Sparkles size={14} className="text-cath-red-700" />
                </div>
                <span className="text-sm font-medium text-black">
                  {t.rooms?.chatBox?.aiSuggestion || "Gợi ý từ AI"}
                </span>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                {settingsPopover}
              </div>
            </div>

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
        {
          activeTab === "room" && (
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
          )
        }
      </div >
    </div >
  )
}

export default ChatBox
