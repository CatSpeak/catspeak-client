import { Forward } from "lucide-react"
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
      .replace(/\s+/g, "")
      .replace(/[\uFE00-\uFE0F\u200D]/gu, "")
      .replace(/\p{Emoji_Modifier}/gu, "")
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
 * ChatBubbleContent — renders message content payload (quotes, recalled state, media, link previews, text, forwarded header, inline editor).
 */
const ChatBubbleContent = ({
  message,
  isOwn,
  currentUserName = "",
  isEditing = false,
  editValue = "",
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  isSavingEdit = false,
}) => {
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
            : "rounded-2xl bg-primaryBg"
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

      {/* Forwarded Header */}
      {!isRecalled && message?.forwardedFromSenderName && (
        <div
          className={`flex items-center gap-1 text-[11px] mb-1 select-none font-medium ${
            isOwn ? "text-white/85" : "text-neutral-500"
          }`}
        >
          <Forward size={13} className="shrink-0" />
          <span>
            {t?.chat?.forwardedFrom || "Forwarded from"}{" "}
            <strong className="font-semibold">
              {message.forwardedFromSenderName}
            </strong>
          </span>
        </div>
      )}

      {/* Recalled State */}
      {isRecalled ? (
        <p className="italic opacity-60 m-0 select-none">
          {t?.chat?.recalledMessage || "Tin nhắn đã bị thu hồi"}
        </p>
      ) : isEditing ? (
        /* Inline Edit Mode */
        <div className="flex flex-col gap-2 min-w-[220px] max-w-full text-left" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={editValue}
            onChange={(e) => onEditChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSaveEdit?.()
              } else if (e.key === "Escape") {
                e.preventDefault()
                onCancelEdit?.()
              }
            }}
            rows={2}
            autoFocus
            className="w-full bg-white dark:bg-zinc-800 text-neutral-900 dark:text-neutral-100 text-sm p-2 rounded-lg border border-primary/50 focus:border-primary focus:outline-hidden resize-none shadow-xs"
          />
          <div className="flex items-center justify-end gap-1.5 select-none">
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSavingEdit}
              className="px-2 py-1 text-xs rounded-md bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 dark:bg-zinc-700 dark:text-neutral-200 transition-colors"
            >
              {t?.chat?.cancel || "Cancel"} (Esc)
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={isSavingEdit || !editValue?.trim()}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingEdit ? t?.chat?.saving || "Saving..." : t?.chat?.save || "Save"} (Enter)
            </button>
          </div>
        </div>
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
                isOwn ? "bg-[#990011] text-white" : "bg-primaryBg text-gray-900"
              } px-4 py-3 rounded-b-2xl rounded-t-none text-left`}
            >
              <FormattedText
                text={textContent}
                isOwn={isOwn}
                currentUserName={currentUserName}
                className="whitespace-pre-wrap break-words m-0 inline-block"
              />
              {message?.isEdited && (
                <span
                  className={`text-[10px] ml-1.5 select-none opacity-75 ${
                    isOwn ? "text-white/80" : "text-neutral-500"
                  }`}
                  title={
                    message?.lastEdited
                      ? new Date(message.lastEdited).toLocaleString()
                      : ""
                  }
                >
                  ({t?.chat?.edited || "edited"})
                </span>
              )}
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
                  : "bg-primaryBg text-gray-900 shadow-xs"
              } px-4 py-3 rounded-b-2xl rounded-t-none text-left`}
            >
              <FormattedText
                text={textContent}
                isOwn={isOwn}
                currentUserName={currentUserName}
                className="whitespace-pre-wrap break-words m-0 inline-block"
              />
              {message?.isEdited && (
                <span
                  className={`text-[10px] ml-1.5 select-none opacity-75 ${
                    isOwn ? "text-white/80" : "text-neutral-500"
                  }`}
                  title={
                    message?.lastEdited
                      ? new Date(message.lastEdited).toLocaleString()
                      : ""
                  }
                >
                  ({t?.chat?.edited || "edited"})
                </span>
              )}
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
              currentUserName={currentUserName}
              className="whitespace-pre-wrap break-words m-0 inline-block max-w-full"
            />
            {message?.isEdited && (
              <span
                className={`text-[10px] ml-1.5 select-none opacity-75 ${
                  isOwn ? "text-white/80" : "text-neutral-500"
                }`}
                title={
                  message?.lastEdited
                    ? new Date(message.lastEdited).toLocaleString()
                    : ""
                }
              >
                ({t?.chat?.edited || "edited"})
              </span>
            )}
          </div>
        )
      )}
    </div>
  )
}

export default ChatBubbleContent
