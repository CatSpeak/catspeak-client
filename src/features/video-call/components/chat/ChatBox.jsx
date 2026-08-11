import React, { useEffect } from "react"
import { Settings, Sparkles } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import Popover from "@/shared/components/ui/Popover"
import Switch from "@/shared/components/ui/inputs/Switch"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import ListItem from "@/shared/components/ui/ListItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import MenuList from "@/shared/components/ui/MenuList"

const ChatBox = ({ messages, onSendMessage, isConnected, className = "" }) => {
  const { t } = useLanguage()
  const {
    aiMessages = [],
    receiveSystemMsgs,
    setReceiveSystemMsgs,
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

  const settingsPopoverContent = (
    <MenuList className="w-[320px]">
      <ListItem
        lines={1}
        rightContent={
          <Switch
            checked={receiveSystemMsgs}
            onChange={(e) => setReceiveSystemMsgs(e.target.checked)}
            colorClass="peer-checked:bg-green-500"
          />
        }
      >
        <span className="text-sm font-medium text-black truncate">
          {t.rooms?.chatBox?.showSystemMessages ||
            "Show Cat Speak suggestion messages"}
        </span>
      </ListItem>
    </MenuList>
  )

  const settingsPopover = (
    <Popover
      trigger={
        <IconButton variant="ghost" aria-label="Settings">
          <Settings />
        </IconButton>
      }
      content={settingsPopoverContent}
      placement="bottom-left"
    />
  )

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
            <ListItem
              lines={1}
              className="border-b border-border shrink-0"
              leftContent={<Sparkles className="text-cath-red-700" />}
              rightContent={
                <div onClick={(e) => e.stopPropagation()}>
                  {settingsPopover}
                </div>
              }
            >
              <span className="font-semibold">
                {t.rooms?.chatBox?.aiSuggestion || "Gợi ý từ AI"}
              </span>
            </ListItem>

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
