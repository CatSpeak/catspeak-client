import React, { useState, useRef, useEffect } from "react"
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
      const newSplit = Math.min(80, Math.max(20, dragRef.current.startSplit + deltaPct))
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
    : { flex: `${aiSplit} 0 0%`, minHeight: 0, overflow: "hidden" }

  const chatStyle = isChatCollapsed
    ? { height: "40px", flexShrink: 0 }
    : { flex: `${100 - aiSplit} 0 0%`, minHeight: 0, overflow: "hidden" }

  const settingsPopover = null

  return (
    <div className={`relative flex h-full flex-col bg-white ${className}`}>
      <div
        ref={containerRef}
        className="flex-1 flex flex-col min-h-0 relative"
      >
        {/* AI Chat Pane */}
        <div
          className={`flex flex-col bg-white overflow-hidden ${!isAiCollapsed ? "border-b border-[#E5E5E5]" : ""}`}
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

        {/* Regular Chat Pane */}
        <div 
          className="flex flex-col bg-white overflow-hidden relative" 
          style={chatStyle}
        >
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
  )
}

export default ChatBox
