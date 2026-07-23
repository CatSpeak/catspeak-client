import React from "react"
import { Reply } from "lucide-react"
import { formatTime } from "@/shared/utils/dateFormatter"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { FormattedText, findUrlsInText } from "@/shared/utils/linkUtils"
import YouTubeEmbed from "@/features/chat/components/messages/YouTubeEmbed"
import LinkPreviewCard from "@/features/chat/components/messages/LinkPreviewCard"

/**
 * Renders vocabulary suggestions inside dynamic cat-head styled pills
 */
const VocabularySuggestions = ({
  vocabulary,
  introMessage,
  expandedIdx,
  setExpandedIdx,
}) => {
  return (
    <div className="flex flex-col gap-2 py-0.5">
      <p className="m-0 text-sm font-medium leading-relaxed">
        {introMessage || "Hoàng thượng gợi ý cho sen vài từ nè:"}
      </p>
      <div className="flex flex-wrap gap-x-1.5 gap-y-3 mt-2.5">
        {vocabulary.map((vocabItem, idx) => {
          const isObject = typeof vocabItem === "object" && vocabItem !== null
          const word = isObject ? vocabItem.word : vocabItem
          const meaning = isObject ? vocabItem.meaning : null
          const isExpanded = expandedIdx === idx && !!meaning

          const colors = [
            "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/90 active:bg-rose-200",
            "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/90 active:bg-blue-200",
            "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/90 active:bg-emerald-200",
            "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100/90 active:bg-violet-200",
            "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/90 active:bg-amber-200",
            "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100/90 active:bg-cyan-200",
          ]
          const colorClass = colors[idx % colors.length]
          return (
            <button
              key={word}
              type="button"
              onClick={() => {
                if (meaning) {
                  setExpandedIdx(isExpanded ? null : idx)
                }
                navigator.clipboard.writeText(word)
              }}
              title={meaning ? "Click to view meaning & copy" : "Click to copy"}
              className={`relative px-3 text-xs font-semibold border cursor-pointer transition-all shadow-sm select-none active:scale-95 ${isExpanded ? "rounded-2xl py-1.5" : "rounded-full py-1"
                } ${colorClass}`}
            >
              {/* Cat ears */}
              <span className="absolute -top-1 left-2.5 w-2 h-2 bg-inherit border-t border-l border-inherit rotate-45 rounded-tl-[2px]" />
              <span className="absolute -top-1 right-2.5 w-2 h-2 bg-inherit border-t border-l border-inherit rotate-45 rounded-tl-[2px]" />

              <div className="flex flex-col items-center">
                <span>{word}</span>
                {isExpanded && (
                  <span className="mt-1 pt-1 border-t border-dashed border-inherit font-normal text-[10px] opacity-90 max-w-[150px] break-words text-center">
                    {meaning}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Renders suggested sentence bubbles popping up sequentially with writing animation
 */
const SentenceSuggestions = ({
  suggestedSentences,
  showText,
  hideText,
  renderFormattedMessage,
}) => {
  const [visibleCount, setVisibleCount] = React.useState(1)
  const [isTypingNext, setIsTypingNext] = React.useState(false)
  const [expandedSentenceIdx, setExpandedSentenceIdx] = React.useState(null)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    if (!suggestedSentences || suggestedSentences.length === 0) return

    setVisibleCount(1)
    setIsTypingNext(suggestedSentences.length > 1)

    if (suggestedSentences.length <= 1) return

    let currentVisible = 1
    const interval = setInterval(() => {
      currentVisible += 1
      setVisibleCount(currentVisible)
      if (currentVisible >= suggestedSentences.length) {
        setIsTypingNext(false)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [suggestedSentences])

  React.useEffect(() => {
    if (suggestedSentences) {
      if (containerRef.current) {
        const lastChild = containerRef.current.lastElementChild
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
      }
    }
  }, [visibleCount, isTypingNext, suggestedSentences])

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 w-full items-start">
      {suggestedSentences.slice(0, visibleCount).map((item, idx) => {
        const isObj = typeof item === "object" && item !== null
        const question = isObj ? item.question : item
        const meaning = isObj ? item.meaning : null
        const isExpanded = expandedSentenceIdx === idx

        return (
          <div
            key={idx}
            className="max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words bg-orange-100 text-orange-900 border border-orange-200/50 shadow-sm"
          >
            <p className="m-0 whitespace-pre-wrap">
              {renderFormattedMessage(question)}
            </p>
            {meaning && (
              <div className="mt-1 flex flex-col items-start gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setExpandedSentenceIdx(isExpanded ? null : idx)
                  }}
                  className="text-[10px] font-semibold text-orange-700 hover:text-orange-900 underline cursor-pointer select-none transition-colors"
                >
                  {isExpanded ? hideText : showText}
                </button>
                {isExpanded && (
                  <p className="m-0 pt-1 text-xs border-t border-orange-300 text-orange-800 w-full">
                    {meaning}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {isTypingNext && (
        <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-orange-100 text-orange-950 border border-orange-200/50 shadow-sm">
          <div className="flex gap-1 items-center h-2 px-1 py-1">
            <span
              className="w-1.5 h-1.5 bg-orange-600/60 rounded-full animate-bounce"
              style={{
                animationDelay: "0s",
                animationDuration: "0.8s",
              }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-orange-600/60 rounded-full animate-bounce"
              style={{
                animationDelay: "0.15s",
                animationDuration: "0.8s",
              }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-orange-600/60 rounded-full animate-bounce"
              style={{
                animationDelay: "0.3s",
                animationDuration: "0.8s",
              }}
            ></span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Message Bubble component rendering chat messages and suggestions
 */
const MessageBubble = ({ msg, t, onReplyTo }) => {
  const [expandedIdx, setExpandedIdx] = React.useState(null)

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

  const isVi = t.rooms?.chatBox?.reply === "Trả lời"
  const isZh = t.rooms?.chatBox?.reply === "回复" || t.rooms?.chatBox?.reply === "回覆"

  const showText = isVi ? "Xem nghĩa" : isZh ? "显示解释" : "Show meaning"
  const hideText = isVi ? "Ẩn nghĩa" : isZh ? "隐藏解释" : "Hide meaning"

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
      <div className={`group flex items-center gap-2 max-w-full ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {msg.suggestedSentences ? (
          <SentenceSuggestions
            suggestedSentences={msg.suggestedSentences}
            showText={showText}
            hideText={hideText}
            renderFormattedMessage={renderFormattedMessage}
          />
        ) : (
          <div
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words ${isMe
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
                className={`flex flex-col border-l-[3px] py-1 px-2 rounded-r-md mb-1.5 cursor-default ${isMe
                  ? "border-white/60 bg-white/10 text-white/90"
                  : msg.status === "error"
                    ? "border-red-400 bg-red-400/10 text-red-900/90"
                    : isSystem
                      ? "border-orange-400 bg-orange-400/10 text-orange-900/90"
                      : isAi
                        ? "border-amber-500 bg-amber-500/10 text-amber-900/90"
                        : "border-[#990011]/60 bg-[#990011]/10 text-black/80"
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
            ) : msg.vocabulary ? (
              <VocabularySuggestions
                vocabulary={msg.vocabulary}
                introMessage={msg.introMessage}
                expandedIdx={expandedIdx}
                setExpandedIdx={setExpandedIdx}
              />
            ) : (
              <p className="m-0 whitespace-pre-wrap">
                {renderFormattedMessage(msg.message)}
              </p>
            )}

            {msg.translatedMessage && (
              <p
                className={`m-0 mt-1 pt-1 text-xs border-t ${isMe
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
        )}

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
    </div>
  )
}

export default MessageBubble