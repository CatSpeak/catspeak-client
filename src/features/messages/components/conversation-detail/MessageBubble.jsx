import React from "react"
import { motion } from "framer-motion"
import { formatTime } from "@/shared/utils/dateFormatter"

const MessageBubble = ({ message, isMyMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: isMyMessage ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
          isMyMessage
            ? "bg-[#990011] text-white shadow"
            : "bg-gray-100 text-gray-800 shadow-inner"
        }`}
      >
        <div>{message.messageContent}</div>
        <div
          className={`text-xs mt-1 ${
            isMyMessage ? "text-white/70" : "text-gray-500"
          }`}
        >
          {formatTime(message.createDate)}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
