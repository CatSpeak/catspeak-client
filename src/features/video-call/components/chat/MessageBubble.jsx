import React from "react"
import { Reply, Globe, RotateCw, Sparkles } from "lucide-react"
import { useTimezone } from "@/shared/hooks/useTimezone"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "@/features/chat/components/messages/YouTubeEmbed"
import LinkPreviewCard from "@/features/chat/components/messages/LinkPreviewCard"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import Badge from "@/shared/components/ui/indicators/Badge"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { isOtherTopic } from "@/features/rooms/utils/formatters"

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
  const rawTopic =
    topicInfo?.topicKey ||
    topicInfo?.topicNameEn ||
    topicInfo?.topicNameVi ||
    topicInfo?.topic ||
    msg.topic ||
    ""
  const shouldShowTopic =
    Boolean(rawTopic) &&
    !isOtherTopic(rawTopic) &&
    !isOtherTopic(topicInfo?.topicNameVi)
  const topicName = topicInfo?.topicNameVi || topicInfo?.topicNameEn || rawTopic

  return (
    <div className="flex flex-col items-start w-full gap-2">
      {/* 1. Header: Icon + Title on left, Topic Badge on right (if valid topic) */}
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          {t.rooms?.chatBox?.aiMeetingSuggestionLabel ||
            "GỢI Ý CÂU CHO BUỔI HỌC"}
        </div>

        {shouldShowTopic && (
          <Badge color="cath-red" title={`${topicLabel} ${topicName}`}>
            {topicName}
          </Badge>
        )}
      </div>

      {/* 2. Intro Box: Light subtle gray background with clean border */}
      <div className="w-full pb-2 text-sm text-neutral-800 dark:text-neutral-200">
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
            className="group w-full text-left bg-white dark:bg-[#1A1A1A] hover:bg-neutral-50 dark:hover:bg-[#252525] active:scale-[0.99] border border-border dark:border-[#3F3F3F] hover:border-neutral-300 dark:hover:border-[#555555] rounded-2xl px-4 py-2 transition-all shadow-2xs flex items-start gap-2 cursor-pointer"
          >
            <span className="text-[20px] shrink-0">{item.icon || "🎓"}</span>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-cath-red-700 dark:group-hover:text-red-400 break-words transition-colors">
                {item.vi || item.targetText}
              </span>

              {item.targetText && item.vi && item.targetText !== item.vi && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 break-words">
                  {item.targetText}
                </div>
              )}
            </div>
          </button>
        ))}

        {/* 4. Load More Suggestions Chip (FR-007) */}
        <button
          type="button"
          onClick={() => onLoadMoreSuggestions?.()}
          className="w-full text-center text-sm py-2 px-4 h-12 border border-dashed border-border dark:border-[#3F3F3F] hover:border-neutral-400 dark:hover:border-neutral-500 bg-transparent hover:bg-neutral-50/80 dark:hover:bg-[#252525] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium rounded-2xl transition-all cursor-pointer"
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
  isRetrying = false,
  isAnyRetrying = false,
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

    const cleanText = text.replace(/^((@(AIPublic|AIPrivate|public-ai|private-ai|AISystem))\s*)+/gi, (m) => `${m.trim().split(/\s+/)[0]} `)



    return (
      <FormattedText
        text={cleanText}
        isOwn={isMe}
        currentUserName={currentUserName}
      />
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

  const displayName = isMe
    ? t?.rooms?.chatBox?.you || t?.chat?.you || "You"
    : senderName

  return (
    <div
      className={`flex flex-col mb-2.5 ${isMe ? "items-end" : "items-start"}`}
    >
      {/* Header Info: Sender Name, Exception Warning (FR-006) & Timestamp */}
      <div className="flex items-center gap-1 mb-1 max-w-full">
        <span
          className={`font-bold text-xs ${isAi ? "text-gray-500 dark:text-[#AAAAAA]" : "text-gray-800 dark:text-neutral-100"} truncate shrink`}
          title={displayName}
        >
          {displayName}
        </span>

        {msg.isPublic && (
          <span className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold ml-0.5 shrink-0">
            <Globe size={12} className="shrink-0" />
            <span>
              {t?.rooms?.chatBox?.aiPublicWarningBadge ||
                "🌐 Công khai với phòng"}
            </span>
          </span>
        )}

        <span className="text-xs text-[#606060] dark:text-[#AAAAAA] shrink-0">
          {formatTime(msg.timestamp)}
        </span>
      </div>

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
              : `max-w-[85%] w-fit rounded-2xl px-3 py-2 text-base break-words transition-all ${
                  isMe
                    ? "bg-[#990011] text-white"
                    : isError || isAi
                      ? "bg-[#fbfbfa] dark:bg-[#1A1A1A] text-gray-900 dark:text-neutral-100 border border-gray-200/90 dark:border-[#3F3F3F] shadow-2xs"
                      : isSystem
                        ? "bg-orange-100 dark:bg-amber-950/40 text-orange-900 dark:text-amber-200"
                        : "bg-[#F0F0F0] dark:bg-[#272727] text-black dark:text-white"
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
            <div className="flex gap-2 items-center py-0.5 text-xs text-gray-500 dark:text-[#AAAAAA] font-medium select-none">
              <div className="flex gap-1 items-center shrink-0">
                <span
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{
                    animationDelay: "0s",
                    animationDuration: "0.8s",
                  }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{
                    animationDelay: "0.15s",
                    animationDuration: "0.8s",
                  }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
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
              <div className="flex items-center gap-1.5 font-bold text-[13.5px] text-amber-600 dark:text-amber-400">
                <span className="text-[14px]">⚠️</span>
                <span>
                  {t.rooms?.chatBox?.aiErrorTitle || "Không thể kết nối trợ lý"}
                </span>
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-gray-800 dark:text-neutral-200 font-normal">
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
                    : "border-black/10 dark:border-white/10 text-black/70 dark:text-neutral-300"
              }`}
            >
              {msg.translatedMessage}
            </p>
          )}
        </div>

        {/* Reply button */}
        {onReplyTo && (!isAi || msg.status === "done") && (
          <IconButton
            type="button"
            variant="ghost"
            onClick={() => onReplyTo(msg)}
            className="-my-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 shrink-0 text-gray-400 dark:text-[#AAAAAA] hover:text-[#990011] dark:hover:text-red-400"
            title={t.rooms?.chatBox?.reply || "Reply"}
            aria-label={t.rooms?.chatBox?.reply || "Reply"}
          >
            <Reply />
          </IconButton>
        )}
      </div>

      {/* Retry Button on Error (E-003) */}
      {isError && onRetryAi && (
        <PillButton
          variant="secondary"
          loading={isRetrying}
          disabled={isAnyRetrying && !isRetrying}
          loadingText={t.rooms?.chatBox?.aiRetrying || "Đang thử lại..."}
          onClick={() =>
            onRetryAi(
              msg.promptRaw || msg.replyTo?.message || msg.message,
              msg.interactionId || msg.id,
              { isPrivateAi: !msg.isPublic }
            )
          }
          startIcon={<RotateCw />}
          className="mt-2 self-start"
        >
          {t.rooms?.chatBox?.aiRetry || "Thử lại"}
        </PillButton>
      )}

      {/* Follow-up Question Buttons (FR-002, FR-005) */}
      {isAi &&
        msg.status === "done" &&
        Array.isArray(msg.followUpSuggestions) &&
        msg.followUpSuggestions.length > 0 &&
        !isUserTyping && (
          <div className="flex flex-col gap-2 mt-2.5 w-full max-w-[85%] items-start animate-fadeIn">
            {/* Section Header: 💡 GỢI Ý CÂU HỎI TIẾP THEO CHO AI: */}
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-500 dark:text-[#AAAAAA] tracking-wide uppercase">
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
                    className="group/btn w-full text-left bg-white dark:bg-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#272727] active:scale-[0.99] border border-gray-200 dark:border-[#3F3F3F] hover:border-gray-300 rounded-full px-4 py-2 transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-[14px] leading-none shrink-0">
                      ❓
                    </span>
                    <span className="text-[13px] text-gray-800 dark:text-neutral-200 group-hover/btn:text-gray-900 dark:group-hover/btn:text-white font-medium leading-snug break-words">
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
