import React from "react"
import { Reply } from "lucide-react"
import { formatTime } from "@/shared/utils/dateFormatter"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "@/features/chat/components/messages/YouTubeEmbed"
import LinkPreviewCard from "@/features/chat/components/messages/LinkPreviewCard"

const MessageBubble = ({ msg, index, t, onReplyTo }) => {
  const renderFormattedMessage = (text) => {
    if (!text) return text

    let prefixNode = null
    let mainText = text

    if (text.startsWith("@AIPublic")) {
      prefixNode = <span className="font-bold pr-1">@AIPublic</span>
      mainText = text.slice(9)
    } else if (text.startsWith("@AIPrivate")) {
      prefixNode = <span className="font-bold pr-1">@AIPrivate</span>
      mainText = text.slice(10)
    } else if (text.startsWith("@public-ai")) {
      prefixNode = <span className="font-bold pr-1">@public-ai</span>
      mainText = text.slice(10)
    } else if (text.startsWith("@private-ai")) {
      prefixNode = <span className="font-bold pr-1">@private-ai</span>
      mainText = text.slice(11)
    } else if (text.startsWith("@AISystem")) {
      prefixNode = <span className="font-bold pr-1">@AISystem</span>
      mainText = text.slice(9)
    }

    return (
      <>
        {prefixNode}
        <FormattedText text={mainText} isOwn={isMe} />
      </>
    )
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
  } else if (senderName === "Public AI" || senderName === "Private AI") {
    senderName = "Cat Speak"
  }

  return (
    <div className={`flex flex-col mb-2 ${isMe ? "items-end" : "items-start"}`}>
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
        {/* Reply Context */}
        {msg.replyTo && (
          <RepliedMessage
            senderName={msg.replyTo.name}
            content={msg.replyTo.message}
            isOwn={isMe}
          />
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
          <div>
            {msg.message &&
              (() => {
                const urlDetailsList = findUrlsInText(msg.message)
                if (urlDetailsList.length === 0) return null
                return (
                  <div className="mb-1 flex flex-col gap-1 w-full">
                    {urlDetailsList.map((urlDetails, idx) => {
                      if (urlDetails.type === "youtube") {
                        return (
                          <YouTubeEmbed
                            key={idx}
                            videoId={urlDetails.youtube.videoId}
                            timestamp={urlDetails.youtube.timestamp}
                            originalUrl={urlDetails.originalUrl}
                            isOwn={isMe}
                            hasCaption={Boolean(msg.message)}
                          />
                        )
                      }
                      return (
                        <LinkPreviewCard
                          key={idx}
                          urlDetails={urlDetails}
                          isOwn={isMe}
                          hasCaption={Boolean(msg.message)}
                        />
                      )
                    })}
                  </div>
                )
              })()}
            <div className="m-0 whitespace-pre-wrap break-words">
              {renderFormattedMessage(msg.message)}
            </div>
          </div>
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

      {/* Reply button */}
      {onReplyTo && (!isAi || msg.status === "done") && (
        <button
          type="button"
          onClick={() => onReplyTo(msg)}
          className="flex items-center gap-1 mt-1 px-2 py-0.5 text-xs text-[#606060] hover:text-[#990011] transition-colors rounded hover:bg-[#F6F6F6]"
        >
          <Reply size={12} />
          <span>{t.rooms?.chatBox?.reply || "Reply"}</span>
        </button>
      )}
    </div>
  )
}

export default MessageBubble
