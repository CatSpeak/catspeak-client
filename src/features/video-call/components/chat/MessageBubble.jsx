import React from "react"
import { Reply, Globe, RotateCw, Sparkles } from "lucide-react"
import { useTimezone } from "@/shared/hooks/useTimezone"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "@/features/chat/components/messages/YouTubeEmbed"
import LinkPreviewCard from "@/features/chat/components/messages/LinkPreviewCard"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const isEmojiOnly = (text) => {
  if (!text || typeof text !== "string") return false
  const clean = text.trim()
  if (!clean) return false
  try {
    const withoutEmojis = clean
      .replace(/[\s\uFE00-\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]/gu, "")
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/\p{Emoji_Presentation}/gu, "")
    return withoutEmojis.length === 0
  } catch {
    return false
  }
}

const splitEmojis = (str) => {
  if (!str) return []
  const clean = str.trim().replace(/\s+/g, "")
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    return Array.from(segmenter.segment(clean), (s) => s.segment)
  }
  return Array.from(clean)
}

/**
 * Renders Meeting Starter Greeting with bilingual topic suggestion cards and Load More chip (FR-001, FR-007)
 */
const StarterGreetingBubble = ({
  msg,
  t,
  onSendSuggestedSentence,
  onLoadMoreSuggestions,
}) => {
  const topicInfo = msg.topicInfo
  const suggestions = msg.suggestions || []

  return (
    <div className="flex flex-col mb-4 items-start w-full">
      {/* Header Label (FR-001) */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-xs font-bold text-cath-red-700 tracking-wide uppercase flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
          {t.rooms?.chatBox?.aiMeetingSuggestionLabel || "🗣️ GỢI Ý CÂU CHO BUỔI HỌC"}
        </span>
        {topicInfo && (
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>{topicInfo.topicIcon}</span>
            <span>{topicInfo.topicNameVi || topicInfo.topicNameEn}</span>
          </span>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-[95%] rounded-2xl p-3.5 bg-gradient-to-br from-red-50/60 via-amber-50/40 to-white text-gray-900 border border-red-100 shadow-sm flex flex-col gap-2.5">
        <p className="m-0 text-xs text-gray-700 leading-relaxed font-medium">
          {t.rooms?.chatBox?.aiGreetingIntro ||
            "Dưới đây là một số gợi ý câu để bạn dễ dàng bắt đầu trò chuyện trong buổi học:"}
        </p>

        {/* Suggestion Cards List */}
        <div className="flex flex-col gap-2 mt-1">
          {suggestions.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => onSendSuggestedSentence?.(item.targetText || item.displayText || item.vi)}
              title="Click để gửi ngay vào phòng học"
              className="group text-left text-xs bg-white hover:bg-red-50/80 active:scale-[0.99] border border-red-200/80 hover:border-red-300 rounded-xl px-3 py-2.5 transition-all shadow-xs flex items-start gap-2 cursor-pointer"
            >
              <span className="text-base shrink-0 leading-none mt-0.5">{item.icon || "💬"}</span>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="font-semibold text-gray-900 group-hover:text-cath-red-700 transition-colors break-words">
                  {item.targetText || item.vi}
                </span>
                {item.targetText && item.vi && item.targetText !== item.vi && (
                  <span className="text-[11px] text-gray-500 font-normal break-words">
                    {item.vi}
                  </span>
                )}
              </div>
            </button>
          ))}

          {/* Load More Suggestions Chip (FR-007 - Load More Pattern) */}
          <button
            type="button"
            onClick={() => onLoadMoreSuggestions?.()}
            className="w-full text-center text-xs py-2 px-3 border border-dashed border-red-300/80 hover:border-red-400 bg-red-50/30 hover:bg-red-50 text-red-800 font-medium rounded-xl opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-2xs"
          >
            {t.rooms?.chatBox?.aiLoadMoreSuggestions || "＋ Gợi ý thêm"}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Message Bubble component rendering chat messages, follow-up buttons, and exception warning labels
 */
const MessageBubble = ({
  msg,
  t,
  onReplyTo,
  onSendSuggestedSentence,
  onLoadMoreSuggestions,
  onSelectFollowUp,
  onRetryAi,
  isUserTyping = false,
}) => {
  const { formatTime } = useTimezone()
  const { user } = useGlobalVideoCall()

  // Special rendering: Starter Greeting (FR-001)
  if (msg.isStarterGreeting) {
    return (
      <StarterGreetingBubble
        msg={msg}
        t={t}
        onSendSuggestedSentence={onSendSuggestedSentence}
        onLoadMoreSuggestions={onLoadMoreSuggestions}
      />
    )
  }

  const currentUserName =
    user?.fullName || user?.username || user?.nickname || user?.email || ""
  const isMe = msg.from?.isLocal ?? false

  const renderFormattedMessage = (text) => {
    if (!text) return text

    let prefixNode = null
    let mainText = text

    if (text.startsWith("@AIPublic")) {
      mainText = text.slice(9)
    } else if (text.startsWith("@AIPrivate")) {
      mainText = text.slice(10)
    } else if (text.startsWith("@public-ai")) {
      mainText = text.slice(10)
    } else if (text.startsWith("@private-ai")) {
      mainText = text.slice(11)
    } else if (text.startsWith("@AISystem")) {
      mainText = text.slice(9)
    }

    return (
      <>
        {prefixNode}
        <FormattedText
          text={mainText.trim()}
          isOwn={isMe}
          currentUserName={currentUserName}
        />
      </>
    )
  }

  const isSystem =
    msg.from?.isSystem || msg.isSystem || (!msg.from && !msg.topic)
  const isAi = msg.from?.isAi || false

  let senderName = msg.from?.name || msg.from?.identity || `User`

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

  const isEmoji =
    !msg.replyTo &&
    !msg.status &&
    !msg.vocabulary &&
    !msg.suggestedSentences &&
    isEmojiOnly(msg.message)

  const isError = msg.status === "error"

  return (
    <div className={`flex flex-col mb-2.5 ${isMe ? "items-end" : "items-start"}`}>
      {/* Header Info: Sender Name & Exception Warning (FR-006) */}
      {!isMe ? (
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
      ) : msg.isPublic ? (
        /* Exception Warning: Public warning badge when user asks Public AI */
        <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold mb-1">
          <Globe size={12} className="shrink-0" />
          <span>{t.rooms?.chatBox?.aiPublicWarningBadge || "🌐 Công khai với phòng"}</span>
          <span className="text-xs text-[#606060] font-normal ml-1">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      ) : (
        /* Private mode: Clean, minimal header (timestamp only) */
        <div className="flex items-center gap-1 mb-1 max-w-full">
          <span className="text-xs text-[#606060] shrink-0">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      )}

      {/* Main Bubble */}
      <div
        className={`group flex items-center gap-2 max-w-full ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={
            isEmoji
              ? "bg-transparent p-0 text-3xl md:text-4xl leading-relaxed select-text border-0 shadow-none min-h-0 min-w-0"
              : `max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words transition-all ${
                  isMe
                    ? "bg-[#990011] text-white"
                    : isError
                      ? "bg-red-50 text-red-950 border border-red-200"
                      : isSystem
                        ? "bg-orange-100 text-orange-900"
                        : isAi
                          ? "bg-amber-50/70 text-amber-950 border border-amber-100"
                          : "bg-[#F0F0F0] text-black"
                }`
          }
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
          ) : isError ? (
            /* AI Error Bubble + Retry Button (E-003) */
            <div className="flex flex-col gap-2">
              <p className="m-0 text-xs leading-relaxed text-red-900 font-medium">
                {msg.message ||
                  t.rooms?.chatBox?.aiErrorResponse ||
                  "Trợ lý AI tạm thời không phản hồi. Vui lòng thử lại."}
              </p>
              {onRetryAi && (
                <button
                  type="button"
                  onClick={() => onRetryAi(msg.promptRaw || msg.message, msg.interactionId)}
                  className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCw size={12} />
                  <span>{t.rooms?.chatBox?.aiRetry || "🔄 Thử lại"}</span>
                </button>
              )}
            </div>
          ) : isEmoji ? (
            <span className="inline-flex flex-wrap items-center -space-x-2 md:-space-x-2.5 text-3xl md:text-4xl leading-none select-text">
              {splitEmojis(msg.message).map((emoji, idx) => (
                <span key={idx} className="inline-block">
                  {emoji}
                </span>
              ))}
            </span>
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
              <p className="m-0 whitespace-pre-wrap break-words">
                {renderFormattedMessage(msg.message)}
              </p>
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
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 flex items-center justify-center p-1.5 text-gray-400 hover:text-[#990011] transition-all rounded-full hover:bg-gray-100 shrink-0"
            title={t.rooms?.chatBox?.reply || "Reply"}
          >
            <Reply size={18} />
          </button>
        )}
      </div>

      {/* Follow-up Question Buttons (FR-002, FR-005) */}
      {isAi &&
        msg.status === "done" &&
        Array.isArray(msg.followUpSuggestions) &&
        msg.followUpSuggestions.length > 0 &&
        !isUserTyping && (
          <div className="flex flex-col gap-1.5 mt-2 w-full max-w-[85%] items-start animate-fadeIn">
            {msg.followUpSuggestions.slice(0, 3).map((q, idx) => {
              const qText = typeof q === "string" ? q : q.question || q.text || ""
              if (!qText) return null
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectFollowUp?.(qText)}
                  className="w-full text-left text-xs bg-white hover:bg-red-50/70 border border-red-200 text-red-900 rounded-xl px-3 py-2 transition-all shadow-2xs hover:border-red-300 active:scale-[0.99] flex items-center justify-between gap-2 group/btn cursor-pointer"
                >
                  <span className="line-clamp-2">{qText}</span>
                  <span className="text-red-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0">
                    →
                  </span>
                </button>
              )
            })}
          </div>
        )}
    </div>
  )
}

export default MessageBubble