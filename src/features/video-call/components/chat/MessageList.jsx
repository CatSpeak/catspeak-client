import React, { useRef, useEffect } from "react"
import { Bot } from "lucide-react"
import { motion } from "framer-motion"
import { formatTime } from "@/shared/utils/dateFormatter"

const MessageList = ({ messages, t, emptyText, aiPromptStatus }) => {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, aiPromptStatus])

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col overflow-y-auto p-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar]:w-1.5 bg-white h-full"
    >
      {messages.length === 0 && !aiPromptStatus?.active ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-center text-[#606060]">{emptyText}</p>
        </div>
      ) : (
        <>
          <div className="flex-1" />
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const isMe = msg.from?.isLocal ?? false
              const isSystem =
                msg.from?.isSystem || msg.isSystem || (!msg.from && !msg.topic)
              const isAi = msg.from?.isAi || false
              let senderName = isMe
                ? t.rooms?.chatBox?.you || "You"
                : msg.from?.name || msg.from?.identity || `User`

              if (senderName === "System (AI Gợi ý)" || senderName === "System (AI Suggestion)" || senderName === "System" || senderName === "Cat Speak gợi ý") {
                senderName = t.rooms?.chatBox?.systemName || "Cat Speak gợi ý"
              } else if (senderName === "Public AI" || senderName === "Private AI") {
                senderName = "Cat Speak"
              }

              return (
                <div
                  key={msg.id || `msg-${index}`}
                  className={`flex flex-col ${
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
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words ${
                      isMe
                        ? "bg-[#990011] text-white"
                        : isSystem
                          ? "bg-orange-100 text-orange-900 border border-orange-200"
                          : isAi
                            ? "bg-amber-50 text-amber-900"
                            : "bg-[#F0F0F0] text-black"
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">
                      {msg.message.startsWith("@AIPublic") ? (
                        <>
                          <span className="font-bold">@AIPublic</span>
                          {msg.message.slice(9)}
                        </>
                      ) : msg.message.startsWith("@AIPrivate") ? (
                        <>
                          <span className="font-bold">@AIPrivate</span>
                          {msg.message.slice(10)}
                        </>
                      ) : msg.message.startsWith("@public-ai") ? (
                        <>
                          <span className="font-bold">@public-ai</span>
                          {msg.message.slice(10)}
                        </>
                      ) : msg.message.startsWith("@private-ai") ? (
                        <>
                          <span className="font-bold">@private-ai</span>
                          {msg.message.slice(11)}
                        </>
                      ) : (
                        msg.message
                      )}
                    </p>
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

            {aiPromptStatus?.active && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="flex flex-col items-start"
              >
                <div className="flex items-center gap-1 mb-1 max-w-full">
                  <span className="text-xs font-bold truncate shrink flex items-center gap-1">
                    Cat Speak
                  </span>
                </div>
                <div className="max-w-[85%] rounded-2xl px-3 py-3 text-sm break-words bg-amber-50 text-amber-900">
                  <div className="flex gap-1 items-center h-2 px-1">
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
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MessageList
