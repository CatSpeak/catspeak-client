import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import MediaAttachment from "./MediaAttachment"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "./YouTubeEmbed"
import LinkPreviewCard from "./LinkPreviewCard"
import { useLanguage } from "@/shared/context/LanguageContext"

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
 * ChatBubbleContent — renders message content payload (quotes, recalled state, media, link previews, text).
 * Accepts simple (message, isOwn) props and computes derived flags internally.
 */
const ChatBubbleContent = ({ message, isOwn }) => {
  const { t } = useLanguage()

  const isRecalled =
    message?.isRecalled ||
    message?.messageType === "Recalled" ||
    message?.content === "[Message Recalled]" ||
    message?.messageContent === "Tin nhắn đã bị thu hồi"

  const parentMsg = message?.parentMessage || message?.replyToMessage
  const parentSenderName =
    parentMsg?.sender?.username ||
    parentMsg?.sender?.name ||
    parentMsg?.senderName ||
    message?.parentSenderName ||
    t?.chat?.someone ||
    "Someone"
  const parentContent =
    parentMsg?.messageContent ||
    parentMsg?.content ||
    message?.parentMessageContent ||
    "Message"

  const mediaUrl =
    message?.mediaUrl || message?.fileUrl || message?.attachmentUrl
  const textContent = message?.content || message?.messageContent || ""

  const isEmoji = !isRecalled && isEmojiOnly(textContent)
  const hasMedia = !isRecalled && Boolean(mediaUrl)
  const urlDetailsList =
    !isRecalled && textContent ? findUrlsInText(textContent) : []
  const hasLinkPreview = !isRecalled && !hasMedia && urlDetailsList.length > 0

  const bubbleClasses = isEmoji
    ? "bg-transparent text-4xl min-h-0 min-w-0"
    : hasMedia || hasLinkPreview
      ? "bg-transparent p-0 min-h-0 min-w-0"
      : `${
          isOwn
            ? "rounded-2xl bg-[#990011] text-white"
            : "rounded-2xl bg-[#F2F2F2]"
        } px-4 py-3 min-h-[40px] min-w-[60px] inline-block max-w-full`

  return (
    <div className={bubbleClasses}>
      {/* Quoted Replied Message (if any) */}
      {!isRecalled && (parentMsg || message?.parentMessageId) && (
        <RepliedMessage
          senderName={parentSenderName}
          content={parentContent}
          isOwn={isOwn}
        />
      )}

      {/* Recalled State */}
      {isRecalled ? (
        <p className="italic opacity-60 m-0 select-none">
          {t?.chat?.recalledMessage || "Tin nhắn đã bị thu hồi"}
        </p>
      ) : hasMedia ? (
        <div className="flex flex-col w-full max-w-[360px]">
          <MediaAttachment
            mediaUrl={mediaUrl}
            messageType={message?.messageType}
            fileName={message?.fileName}
            fileSize={message?.fileSize}
            message={message}
            isOwn={isOwn}
            hasCaption={Boolean(textContent)}
          />
          {textContent && (
            <div
              className={`w-full ${
                isOwn ? "bg-[#990011] text-white" : "bg-[#F2F2F2] text-gray-900"
              } px-4 py-3 rounded-b-2xl rounded-t-none text-left`}
            >
              <FormattedText
                text={textContent}
                isOwn={isOwn}
                className="whitespace-pre-wrap break-words m-0 block"
              />
            </div>
          )}
        </div>
      ) : hasLinkPreview ? (
        <div className="flex flex-col w-full max-w-[360px]">
          {urlDetailsList.map((urlDetails, idx) => {
            if (urlDetails.type === "youtube") {
              return (
                <YouTubeEmbed
                  key={idx}
                  videoId={urlDetails.youtube.videoId}
                  timestamp={urlDetails.youtube.timestamp}
                  originalUrl={urlDetails.originalUrl}
                  isOwn={isOwn}
                  hasCaption={Boolean(textContent)}
                />
              )
            }
            return (
              <LinkPreviewCard
                key={idx}
                urlDetails={urlDetails}
                isOwn={isOwn}
                hasCaption={Boolean(textContent)}
              />
            )
          })}
          {textContent && (
            <div
              className={`w-full ${
                isOwn
                  ? "bg-[#990011] text-white"
                  : "bg-[#F2F2F2] text-gray-900 shadow-xs"
              } px-4 py-3 rounded-b-2xl rounded-t-none text-left`}
            >
              <FormattedText
                text={textContent}
                isOwn={isOwn}
                className="whitespace-pre-wrap break-words m-0 block"
              />
            </div>
          )}
        </div>
      ) : isEmoji ? (
        <span className="inline-flex flex-wrap items-center -space-x-2 md:-space-x-2.5 text-3xl md:text-4xl leading-none select-text">
          {splitEmojis(textContent).map((emoji, idx) => (
            <span key={idx} className="inline-block">{emoji}</span>
          ))}
        </span>
      ) : (
        /* Text only message */
        textContent && (
          <div className="inline-block max-w-full">
            <FormattedText
              text={textContent}
              isOwn={isOwn}
              className="whitespace-pre-wrap break-words m-0 inline-block max-w-full"
            />
          </div>
        )
      )}
    </div>
  )
}

export default ChatBubbleContent
