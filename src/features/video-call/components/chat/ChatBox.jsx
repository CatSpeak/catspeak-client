import React, { useState, useRef, useCallback } from "react"
import {
  Settings,
  ChevronDown,
  ChevronRight,
  GripHorizontal,
  Bot,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Switch from "@/shared/components/ui/inputs/Switch"
import Popover from "@/shared/components/ui/Popover"
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
    receiveSystemMsgs,
    setReceiveSystemMsgs,
    aiMessages,
    aiPromptStatus,
  } = useGlobalVideoCall()

  const containerRef = useRef(null)
  const [aiPaneHeight, setAiPaneHeight] = useState(50)
  const [isAiCollapsed, setIsAiCollapsed] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)

  const handleDrag = useCallback((e) => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    let newHeightPercentage =
      ((e.clientY - containerRect.top) / containerRect.height) * 100
    newHeightPercentage = Math.max(20, Math.min(80, newHeightPercentage))
    setAiPaneHeight(newHeightPercentage)
  }, [])

  const startDrag = useCallback(
    (e) => {
      e.preventDefault()
      const onMouseMove = (moveEvent) => handleDrag(moveEvent)
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.body.style.cursor = "default"
      }
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
      document.body.style.cursor = "row-resize"
    },
    [handleDrag],
  )

  const settingsPopover = (
    <Popover
      trigger={
        <Settings
          size={20}
          className="text-[#606060] hover:text-black transition-colors"
        />
      }
      content={
        <div className="w-64 bg-white rounded-lg shadow-lg border border-[#E5E5E5] px-3 py-2 h-10 flex items-center justify-between">
          <span className="text-sm">
            {t.rooms?.chatBox?.showSystemMessages || "Show System Messages"}
          </span>
          <Switch
            checked={receiveSystemMsgs}
            onChange={() => setReceiveSystemMsgs(!receiveSystemMsgs)}
            colorClass="peer-checked:bg-green-500"
          />
        </div>
      }
    />
  )

  const aiStyle = isAiCollapsed
    ? { height: "40px", flexShrink: 0 }
    : isChatCollapsed
      ? { flex: 1, minHeight: 0 }
      : { height: `${aiPaneHeight}%`, minHeight: 0 }

  const chatStyle = isChatCollapsed
    ? { height: "40px", flexShrink: 0 }
    : isAiCollapsed
      ? { flex: 1, minHeight: 0 }
      : { height: `${100 - aiPaneHeight}%`, minHeight: 0 }

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
                aiPromptStatus={aiPromptStatus}
              />
              <ChatInput
                onSendMessage={onSendMessage}
                isConnected={isConnected}
                onAiMessageSent={() => setIsAiCollapsed(false)}
                isAiInput={true}
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
        <div className="flex flex-col bg-white" style={chatStyle}>
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
