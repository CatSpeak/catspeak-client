import { Forward } from "lucide-react"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import MediaAttachment from "./MediaAttachment"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "./YouTubeEmbed"
import LinkPreviewCard from "./LinkPreviewCard"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getMessagePreview } from "../../utils/messagePreviewUtils"

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
  knownNames = [],
  onJumpToMessage,
}) => {
  const { t } = useLanguage()

  const isRecalled =
    message?.isRecalled ||
    message?.messageType === "Recalled" ||
    message?.content === "[Message Recalled]" ||
    message?.messageContent === "Tin nhắn đã bị thu hồi"

  const parentMsg = message?.parentMessage || message?.replyToMessage
  const rawParentSenderName =
    parentMsg?.sender?.username ||
    parentMsg?.sender?.name ||
    parentMsg?.senderName ||
    message?.parentSenderName ||
    ""
  const isParentOwn =
    Boolean(currentUserName) &&
    (rawParentSenderName === currentUserName ||
      String(parentMsg?.senderId) === String(message?.currentUserId))
  const parentSenderName = isParentOwn
    ? t?.chat?.you || "You"
    : rawParentSenderName || t?.chat?.someone || "Someone"

  const parentContent =
    getMessagePreview(parentMsg, t) ||
    message?.parentMessageContent ||
    t?.chat?.message ||
    "Message"

  const parentMsgId =
    parentMsg?.id ||
    parentMsg?.messageId ||
    message?.parentMessageId ||
    message?.parentMessage?.id

  const mediaUrl =
    message?.mediaUrl || message?.fileUrl || message?.attachmentUrl
  const textContent = message?.content || message?.messageContent || ""

  const isEmoji = !isRecalled && isEmojiOnly(textContent)
  const hasMedia = !isRecalled && Boolean(mediaUrl)
  const urlDetailsList =
    !isRecalled && textContent ? findUrlsInText(textContent) : []
  const hasLinkPreview = !isRecalled && !hasMedia && urlDetailsList.length > 0
  const hasReply = !isRecalled && Boolean(parentMsg || message?.parentMessageId)
  const hasForward = !isRecalled && Boolean(message?.forwardedFromSenderName)
  const hasHeader = hasReply || hasForward

  const msgTypeLower = String(message?.messageType || "").toLowerCase()
  const isAudio =
    Boolean(mediaUrl) &&
    (["audio", "voice", "4"].includes(msgTypeLower) ||
      message?.audioDuration != null ||
      Boolean(mediaUrl.match(/\.(weba|mp3|wav|m4a|aac|oga|opus)(\?.*)?$/i)) ||
      (Boolean(mediaUrl.match(/\.webm(\?.*)?$/i)) &&
        (msgTypeLower === "audio" || !mediaUrl.match(/video/i))))

  const isBubbleCard =
    !isRecalled &&
    !isEmoji &&
    ((!hasMedia && !hasLinkPreview) || hasHeader || isAudio)

  const bubbleClasses = isEmoji
    ? "bg-transparent text-4xl min-h-0 min-w-0"
    : isRecalled
      ? `rounded-2xl border border-border px-4 py-3 select-none inline-flex items-center gap-1 ${
          isOwn
            ? "bg-neutral-100/90 text-neutral-500"
            : "bg-primaryBg text-neutral-500"
        }`
      : isBubbleCard
        ? `${
            isOwn
              ? "rounded-2xl bg-[#990011] text-white"
              : "rounded-2xl bg-primaryBg text-neutral-900"
          } ${
            hasMedia || hasLinkPreview
              ? isAudio
                ? "p-0 overflow-hidden inline-flex flex-col w-fit max-w-[340px]"
                : "p-0 overflow-hidden flex flex-col w-full max-w-[360px]"
              : "px-4 py-3 min-h-[40px] min-w-[60px] inline-block max-w-full"
          }`
        : `bg-transparent p-0 min-h-0 min-w-0 flex flex-col ${
            isOwn ? "items-end" : "items-start"
          } w-full max-w-[360px]`

  return (
    <div className={bubbleClasses}>
      {/* Quoted Replied Message (if any) */}
      {hasReply && (
        <div className={hasMedia || hasLinkPreview ? "px-4 pt-4" : ""}>
          <RepliedMessage
            senderName={parentSenderName}
            content={parentContent}
            isOwn={isOwn}
            standalone={false}
            onClick={
              parentMsgId && onJumpToMessage
                ? () => onJumpToMessage(parentMsgId)
                : undefined
            }
          />
        </div>
      )}

      {/* Forwarded Header */}
      {hasForward && (
        <div
          className={`flex items-center gap-1 text-xs select-none font-medium ${
            hasMedia || hasLinkPreview ? "px-4 pt-3" : "mb-1"
          } ${isOwn ? "text-white" : "text-secondary"}`}
        >
          <Forward size={14} className="shrink-0" />
          <span>
            {t?.chat?.forwardedFrom || "Forwarded from"}{" "}
            <strong className="font-semibold text-inherit">
              {message.forwardedFromSenderName}
            </strong>
          </span>
        </div>
      )}

      {/* Recalled State */}
      {isRecalled ? (
        <div className="flex items-center">
          <span className="italic select-none">
            {t?.chat?.recalledMessage || "Tin nhắn đã bị thu hồi"}
          </span>
        </div>
      ) : isEditing ? (
        /* Inline Edit Mode */
        <div
          className="flex flex-col gap-2 min-w-[220px] max-w-full text-left"
          onClick={(e) => e.stopPropagation()}
        >
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
            className="w-full bg-white text-neutral-900 text-sm p-2 rounded-lg border border-primary/50 focus:border-primary focus:outline-hidden resize-none shadow-xs"
          />
          <div className="flex items-center justify-end gap-1.5 select-none">
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSavingEdit}
              className="px-2 py-1 text-xs rounded-md bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 transition-colors"
            >
              {t?.chat?.cancel || "Cancel"} (Esc)
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={isSavingEdit || !editValue?.trim()}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingEdit
                ? t?.chat?.saving || "Saving..."
                : t?.chat?.save || "Save"}{" "}
              (Enter)
            </button>
          </div>
        </div>
      ) : hasMedia ? (
        <div
          className={`flex flex-col w-full max-w-[360px] ${isOwn ? "items-end" : "items-start"}`}
        >
          <MediaAttachment
            mediaUrl={mediaUrl}
            messageType={message?.messageType}
            fileName={message?.fileName}
            fileSize={message?.fileSize}
            message={message}
            isOwn={isOwn}
            hasCaption={Boolean(textContent)}
            hasHeader={hasHeader}
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
                knownNames={knownNames}
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
        <div
          className={`flex flex-col w-full max-w-[360px] ${isOwn ? "items-end" : "items-start"}`}
        >
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
                knownNames={knownNames}
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
            <span key={idx} className="inline-block">
              {emoji}
            </span>
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
              knownNames={knownNames}
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
