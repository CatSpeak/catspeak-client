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
 * Directly matches design in reference mockup (no colored background wrapper).
 */
const StarterGreetingBubble = ({
  msg,
  t,
  onSendSuggestedSentence,
  onLoadMoreSuggestions,
}) => {
  const topicInfo = msg.topicInfo
  const suggestions = msg.suggestions || []
  const topicLabel = t.rooms?.chatBox?.aiTopicLabel || "Chủ đề:"
  const topicName =
    topicInfo?.topicNameVi || topicInfo?.topicNameEn || "Du lịch & Giao tiếp"

  return (
    <div className="flex flex-col mb-4 items-start w-full gap-2.5">
      {/* 1. Header: Icon + Title on left, Solid Maroon Topic Badge on right */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-1.5 font-bold text-[13px] text-[#b91c1c] tracking-tight">
          <span>🎓</span>
          <span>
            {t.rooms?.chatBox?.aiMeetingSuggestionLabel ||
              "GỢI Ý CÂU CHO BUỔI HỌC"}
          </span>
        </div>
        <div className="bg-[#b91c1c] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs whitespace-nowrap">
          {topicLabel} {topicName}
        </div>
      </div>

      {/* 2. Intro Box: Light subtle gray background with clean border */}
      <div className="w-full bg-[#fbfbfa] border border-gray-200/90 rounded-2xl px-4 py-3 text-[13px] text-gray-800 leading-snug">
        {t.rooms?.chatBox?.aiGreetingIntro ||
          "Xin chào! Dưới đây là các câu gợi ý theo chủ đề buổi học hôm nay để bạn luyện nói hoặc gửi vào phòng học:"}
      </div>

      {/* 3. Suggestion Cards List */}
      <div className="w-full flex flex-col gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={item.id || idx}
            type="button"
            onClick={() =>
              onSendSuggestedSentence?.(
                item.targetText || item.displayText || item.vi,
                item,
              )
            }
            title={
              t.rooms?.chatBox?.aiAskVocabularyTooltip ||
              "Click để hỏi AI từ vựng cho câu này"
            }
            className="group w-full text-left bg-white hover:bg-red-50/40 active:scale-[0.99] border border-red-200 hover:border-red-300 rounded-2xl px-4 py-2.5 transition-all shadow-2xs flex flex-col gap-0.5 cursor-pointer"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-[14px] leading-none shrink-0">
                {item.icon || "🎓"}
              </span>
              <span className="font-bold text-[13.5px] text-[#b91c1c] group-hover:text-red-800 leading-snug break-words">
                {item.vi || item.targetText}
              </span>
            </div>
            {item.targetText && item.vi && item.targetText !== item.vi && (
              <div className="text-[12px] text-gray-600 font-normal leading-tight pl-5 break-words">
                {item.targetText}
              </div>
            )}
          </button>
        ))}

        {/* 4. Load More Suggestions Chip (FR-007) */}
        <button
          type="button"
          onClick={() => onLoadMoreSuggestions?.()}
          className="w-full text-center text-[13px] py-2.5 border border-dashed border-red-300/80 hover:border-red-400 bg-transparent hover:bg-red-50/30 text-gray-600 hover:text-gray-800 font-medium rounded-2xl transition-all cursor-pointer mt-0.5"
        >
          {t.rooms?.chatBox?.aiLoadMoreSuggestions || "+ Gợi ý thêm"}
        </button>
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
  } else if (
    senderName === "Public AI" ||
    senderName === "Private AI" ||
    senderName === "Cat Speak"
  ) {
    senderName = t.rooms?.chatBox?.aiAssistant || "Trợ lý Cat Speak"
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
            className={`text-xs ${isAi ? "text-gray-500 font-medium" : "font-bold text-gray-800"} truncate shrink flex items-center gap-1`}
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
              : `max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words transition-all ${
                  isMe
                    ? "bg-[#990011] text-white"
                    : isError
                      ? "bg-[#fff5f5] text-gray-900 border border-red-200 shadow-2xs"
                      : isSystem
                        ? "bg-orange-100 text-orange-900"
                        : isAi
                          ? "bg-[#fbfbfa] text-gray-900 border border-gray-200/90 shadow-2xs"
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
            <div className="flex gap-2 items-center py-0.5 text-xs text-gray-500 font-medium select-none">
              <div className="flex gap-1 items-center shrink-0">
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: "0s",
                    animationDuration: "0.8s",
                  }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: "0.15s",
                    animationDuration: "0.8s",
                  }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: "0.3s",
                    animationDuration: "0.8s",
                  }}
                ></span>
              </div>
              <span className="italic">
                {t.rooms?.chatBox?.aiTypingResponse ||
                  "AI đang soạn câu trả lời..."}
              </span>
            </div>
          ) : isError ? (
            /* AI Error Card (E-003) */
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-bold text-[13.5px] text-[#b91c1c]">
                <span className="text-[14px]">⚠️</span>
                <span>
                  {t.rooms?.chatBox?.aiErrorTitle ||
                    "Không thể kết nối trợ lý"}
                </span>
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-gray-800 font-normal">
                {msg.message ||
                  t.rooms?.chatBox?.aiErrorResponse ||
                  "Timeout hoặc lỗi mạng khi trợ lý AI xử lý câu hỏi. Vui lòng thử lại."}
              </p>
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

      {/* Retry Button on Error (E-003) */}
      {isError && onRetryAi && (
        <button
          type="button"
          onClick={() =>
            onRetryAi(msg.promptRaw || msg.message, msg.interactionId)
          }
          className="mt-2 inline-flex items-center gap-1.5 self-start px-3 py-1.5 text-xs font-medium text-[#990011] bg-white border border-[#990011] rounded-lg hover:bg-red-50 active:scale-[0.99] transition-all shadow-2xs cursor-pointer"
        >
          <RotateCw size={13} className="text-blue-500 shrink-0" />
          <span>{t.rooms?.chatBox?.aiRetry || "Thử lại"}</span>
        </button>
      )}

      {/* Follow-up Question Buttons (FR-002, FR-005) */}
      {isAi &&
        msg.status === "done" &&
        Array.isArray(msg.followUpSuggestions) &&
        msg.followUpSuggestions.length > 0 &&
        !isUserTyping && (
          <div className="flex flex-col gap-2 mt-2.5 w-full max-w-[85%] items-start animate-fadeIn">
            {/* Section Header: 💡 GỢI Ý CÂU HỎI TIẾP THEO CHO AI: */}
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-500 tracking-wide uppercase">
              <span>💡</span>
              <span>
                {t.rooms?.chatBox?.aiFollowUpHeader ||
                  "GỢI Ý CÂU HỎI TIẾP THEO CHO AI:"}
              </span>
            </div>

            {/* Questions Pill List */}
            <div className="w-full flex flex-col gap-2">
              {msg.followUpSuggestions.slice(0, 3).map((q, idx) => {
                const qText =
                  typeof q === "string" ? q : q.question || q.text || ""
                if (!qText) return null
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectFollowUp?.(qText)}
                    className="group/btn w-full text-left bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-200 hover:border-gray-300 rounded-full px-4 py-2 transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-[14px] leading-none shrink-0">❓</span>
                    <span className="text-[13px] text-gray-800 group-hover/btn:text-gray-900 font-medium leading-snug break-words">
                      {qText}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
    </div>
  )
}

export default MessageBubble