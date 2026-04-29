import React, { useRef, useEffect } from "react"
import { Bot, Reply } from "lucide-react"
import { motion } from "framer-motion"
import { formatTime } from "@/shared/utils/dateFormatter"

const MessageList = ({ messages, t, emptyText }) => {
  const scrollRef = useRef(null)
  const prevMessagesLength = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      // If user is within 300px of the bottom, or this is the first render with messages
      const isScrolledNearBottom = scrollHeight - scrollTop - clientHeight < 300
      if (isScrolledNearBottom || prevMessagesLength.current === 0) {
        scrollRef.current.scrollTop = scrollHeight
      }
      prevMessagesLength.current = messages.length
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col overflow-y-auto p-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 bg-white h-full"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-center text-[#606060]">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="flex-1" />
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const renderFormattedMessage = (text) => {
                if (!text) return text
                if (text.startsWith("@AIPublic")) {
                  return (
                    <>
                      <span className="font-bold">@AIPublic</span>
                      {text.slice(9)}
                    </>
                  )
                }
                if (text.startsWith("@AIPrivate")) {
                  return (
                    <>
                      <span className="font-bold">@AIPrivate</span>
                      {text.slice(10)}
                    </>
                  )
                }
                if (text.startsWith("@public-ai")) {
                  return (
                    <>
                      <span className="font-bold">@public-ai</span>
                      {text.slice(10)}
                    </>
                  )
                }
                if (text.startsWith("@private-ai")) {
                  return (
                    <>
                      <span className="font-bold">@private-ai</span>
                      {text.slice(11)}
                    </>
                  )
                }
                return text
              }

              const isMe = msg.from?.isLocal ?? false
              const isSystem =
                msg.from?.isSystem || msg.isSystem || (!msg.from && !msg.topic)
              const isAi = msg.from?.isAi || false
              let senderName = isMe
                ? t.rooms?.chatBox?.you || "You"
                : msg.from?.name || msg.from?.identity || `User`

              if (
                senderName === "System (AI Gợi ý)" ||
                senderName === "System (AI Suggestion)" ||
                senderName === "System" ||
                senderName === "Cat Speak gợi ý"
              ) {
                senderName = t.rooms?.chatBox?.systemName || "Cat Speak gợi ý"
              } else if (
                senderName === "Public AI" ||
                senderName === "Private AI"
              ) {
                senderName = "Cat Speak"
              }

              return (
                <div
                  key={msg.id || `msg-${index}`}
                  className={`flex flex-col mb-2 ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1 max-w-full">
                    <span
                      className="text-xs font-bold truncate shrink flex items-center gap-1"
                      title={senderName}
                    >
                      {senderName}
                    </span>
                    <span className="text-xs text-[#606060] shrink-0">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Main Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words ${
                      isMe
                        ? "bg-[#990011] text-white"
                        : msg.status === "error"
                          ? "bg-red-100 text-red-900 border border-red-200"
                          : isSystem
                            ? "bg-orange-100 text-orange-900"
                            : isAi
                              ? "bg-amber-50 text-amber-900"
                              : "bg-[#F0F0F0] text-black"
                    }`}
                  >
                    {/* Reply Context - Zalo Style */}
                    {msg.replyTo && (
                      <div
                        className={`flex flex-col border-l-[3px] py-1 px-2 rounded-r-md mb-1.5 cursor-default ${
                          isMe
                            ? "border-white/60 bg-white/10 text-white/90"
                            : msg.status === "error"
                              ? "border-red-400 bg-red-400/10 text-red-900/90"
                              : isSystem
                                ? "border-orange-400 bg-orange-400/10 text-orange-900/90"
                                : isAi
                                  ? "border-amber-500 bg-amber-500/10 text-amber-900/90"
                                  : "border-blue-500 bg-blue-500/10 text-black/80"
                        }`}
                      >
                        <span className="font-semibold text-xs shrink-0">
                          {msg.replyTo.name}
                        </span>
                        <span className="truncate opacity-80 text-xs">
                          {renderFormattedMessage(msg.replyTo.message)}
                        </span>
                      </div>
                    )}

                    {msg.status === "loading" ? (
                      <div className="flex gap-1 items-center h-2 px-1 py-1">
                        <span
                          className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-bounce"
                          style={{
                            animationDelay: "0s",
                            animationDuration: "0.8s",
                          }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-bounce"
                          style={{
                            animationDelay: "0.15s",
                            animationDuration: "0.8s",
                          }}
                        ></span>
                        <span
                          className="w-1.5 h-1.5 bg-amber-600/60 rounded-full animate-bounce"
                          style={{
                            animationDelay: "0.3s",
                            animationDuration: "0.8s",
                          }}
                        ></span>
                      </div>
                    ) : (
                      <p className="m-0 whitespace-pre-wrap">
                        {renderFormattedMessage(msg.message)}
                      </p>
                    )}

                    {msg.translatedMessage && (
                      <p
                        className={`m-0 mt-1 pt-1 text-xs border-t ${
                          isMe
                            ? "border-white/20 text-white/90"
                            : isSystem
                              ? "border-orange-300 text-orange-800"
                              : "border-black/10 text-black/70"
                        }`}
                      >
                        {msg.translatedMessage}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default MessageList
