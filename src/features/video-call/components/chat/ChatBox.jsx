import React, { useState, useRef, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  GripHorizontal,
  Settings,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import Popover from "@/shared/components/ui/Popover"
import Switch from "@/shared/components/ui/inputs/Switch"
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
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    isChatCollapsed,
    setIsChatCollapsed,
    isAiCollapsed,
    setIsAiCollapsed,
    unreadRoomChat,
    unreadAiChat,
  } = useGlobalVideoCall()

  const [aiReplyTarget, setAiReplyTarget] = useState(null)
  const [roomReplyTarget, setRoomReplyTarget] = useState(null)
  const [aiSplit, setAiSplit] = useState(50) // percentage (0-100)
  const containerRef = useRef(null)
  const dragRef = useRef({ isDragging: false, startY: 0, startSplit: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging) return
      if (!containerRef.current) return
      const containerHeight = containerRef.current.clientHeight
      if (containerHeight <= 0) return
      const deltaY = e.clientY - dragRef.current.startY
      const deltaPct = (deltaY / containerHeight) * 100
      const newSplit = Math.min(
        80,
        Math.max(20, dragRef.current.startSplit + deltaPct),
      )
      setAiSplit(newSplit)
    }

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const startDrag = (e) => {
    e.preventDefault()
    dragRef.current = {
      isDragging: true,
      startY: e.clientY,
      startSplit: aiSplit,
    }
    document.body.style.cursor = "row-resize"
    document.body.style.userSelect = "none"
  }

  const aiStyle = isAiCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { flex: `${aiSplit} 0 0%`, minHeight: 0 }

  const chatStyle = isChatCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { flex: `${100 - aiSplit} 0 0%`, minHeight: 0 }

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
          size={20}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        />
      }
      content={settingsPopoverContent}
      placement="bottom-right"
    />
  )

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      <div ref={containerRef} className="flex-1 flex flex-col min-h-0 relative">
        {/* AI Chat Pane */}
        <div
          className={`flex flex-col bg-white relative z-20 ${!isAiCollapsed ? "border-b border-[#E5E5E5]" : ""}`}
          style={aiStyle}
        >
          <button
            type="button"
            onClick={() => setIsAiCollapsed(!isAiCollapsed)}
            className="flex items-center gap-2 px-4 h-10 w-full hover:bg-[#F6F6F6] border-b border-[#E5E5E5] shrink-0 text-left"
          >
            {isAiCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
            <h3 className="text-sm">
              {t.rooms?.chatBox?.aiAssistant || "AI Assistant"}
            </h3>
            {isAiCollapsed && unreadAiChat > 0 && (
              <div className="ml-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                {unreadAiChat > 9 ? "9+" : unreadAiChat}
              </div>
            )}
            <div onClick={(e) => e.stopPropagation()} className="ml-auto">
              {settingsPopover}
            </div>
          </button>
          {!isAiCollapsed && (
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
                onAiMessageSent={() => setIsAiCollapsed(false)}
                isAiInput={true}
                replyTarget={aiReplyTarget}
                onCancelReply={() => setAiReplyTarget(null)}
              />
            </>
          )}
        </div>

        {/* Draggable Divider */}
        {!isAiCollapsed && !isChatCollapsed && (
          <div
            className="relative z-10 h-2 bg-[#F6F6F6] hover:bg-red-50 cursor-row-resize flex items-center justify-center shrink-0 transition-colors"
            onMouseDown={startDrag}
          >
            <GripHorizontal size={14} className="text-[#606060]" />
          </div>
        )}

        {/* Regular Chat Pane */}
        <div className="flex flex-col bg-white relative z-0" style={chatStyle}>
          <button
            type="button"
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className="flex items-center gap-2 px-4 h-10 w-full hover:bg-[#F6F6F6] border-b border-[#E5E5E5] shrink-0 text-left"
          >
            {isChatCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
            <h3 className="text-sm">
              {t.rooms?.chatBox?.title || "Room Chat"}
            </h3>
            {isChatCollapsed && unreadRoomChat > 0 && (
              <div className="ml-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm">
                {unreadRoomChat > 9 ? "9+" : unreadRoomChat}
              </div>
            )}
          </button>
          {!isChatCollapsed && (
            <>
              <MessageList
                messages={messages}
                t={t}
                emptyText={t.rooms?.chatBox?.empty || "No messages yet"}
                onReplyTo={(msg) => setRoomReplyTarget(msg)}
              />
              <ChatInput
                onSendMessage={onSendMessage}
                isConnected={isConnected}
                replyTarget={roomReplyTarget}
                onCancelReply={() => setRoomReplyTarget(null)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatBox
