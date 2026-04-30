import React, { useState, useRef } from "react"
import { ChevronDown, ChevronRight, GripHorizontal } from "lucide-react"
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
  const { aiMessages = [] } = useGlobalVideoCall()
  
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [replyTarget, setReplyTarget] = useState(null)
  
  const [isAiCollapsed, setIsAiCollapsed] = useState(false)
  const [aiHeight, setAiHeight] = useState(250)
  const containerRef = useRef(null)
  const dragRef = useRef({ isDragging: false, startY: 0, startHeight: 0 })

  const startDrag = (e) => {
    e.preventDefault()
    dragRef.current = {
      isDragging: true,
      startY: e.clientY,
      startHeight: aiHeight,
    }
    document.addEventListener("mousemove", onDrag)
    document.addEventListener("mouseup", stopDrag)
  }

  const onDrag = (e) => {
    if (!dragRef.current.isDragging) return
    const deltaY = e.clientY - dragRef.current.startY
    const newHeight = Math.max(100, dragRef.current.startHeight + deltaY)
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight
      if (newHeight > containerHeight - 100) return
    }
    setAiHeight(newHeight)
  }

  const stopDrag = () => {
    dragRef.current.isDragging = false
    document.removeEventListener("mousemove", onDrag)
    document.removeEventListener("mouseup", stopDrag)
  }

  const aiStyle = isAiCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { height: `${aiHeight}px`, flexShrink: 0 }

  const chatStyle = isChatCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { flex: 1, minHeight: 0 }

  const settingsPopover = null

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
      >
        {/* AI Chat Pane */}
        <div
          className={`flex flex-col bg-white ${!isAiCollapsed ? "border-b border-[#E5E5E5]" : ""}`}
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
                onReplyTo={(msg) => setReplyTarget(msg)}
              />
              <ChatInput
                onSendMessage={onSendMessage}
                isConnected={isConnected}
                onAiMessageSent={() => setIsAiCollapsed(false)}
                isAiInput={true}
                replyTarget={replyTarget}
                onCancelReply={() => setReplyTarget(null)}
              />
            </>
          )}
        </div>

        {/* Draggable Divider */}
        {!isAiCollapsed && !isChatCollapsed && (
          <div
            className="h-2 bg-[#F6F6F6] hover:bg-red-50 cursor-row-resize flex items-center justify-center shrink-0 transition-colors z-10"
            onMouseDown={startDrag}
          >
            <GripHorizontal size={14} className="text-[#606060]" />
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Regular Chat Pane */}
          <div className="flex flex-col bg-white h-full" style={chatStyle}>
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
            </button>
            {!isChatCollapsed && (
              <>
                <MessageList
                  messages={messages}
                  t={t}
                  emptyText={t.rooms?.chatBox?.empty || "No messages yet"}
                />
                <ChatInput
                  onSendMessage={onSendMessage}
                  isConnected={isConnected}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
