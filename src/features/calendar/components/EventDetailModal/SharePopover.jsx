import React from "react"
import { Share2, Copy, Check, Loader2 } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useEventShare from "../../hooks/useEventShare"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Self-contained share button with a popover that shows the generated link
 * and a copy-to-clipboard action.
 */
const SharePopover = ({ eventId, occurrenceId }) => {
  const { t } = useLanguage()
  const {
    shareRef,
    sharePopoverOpen,
    shareUrl,
    copied,
    isSharing,
    handleShare,
    handleCopy,
  } = useEventShare(eventId, occurrenceId)

  return (
    <div className="relative" ref={shareRef}>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors shrink-0 flex items-center justify-center rounded-full w-10 h-10 disabled:opacity-50"
        title={t.calendar?.shareEvent || "Chia sẻ sự kiện"}
      >
        {isSharing ? <Loader2 className="animate-spin" /> : <Share2 />}
      </button>

      <AnimatePresence>
        {sharePopoverOpen && shareUrl && (
          <FluentAnimation
            direction="up"
            exit
            className="absolute bottom-12 right-0 z-50"
          >
            <div className="w-80 bg-white border border-[#e5e5e5] rounded-xl shadow-xl p-5">
              <p className="text-sm mb-2">{t.calendar?.shareLink || "Chia sẻ liên kết"}</p>
              <div className="mb-1 h-10 flex items-center gap-2 bg-[#f2f2f2] border border-[#e5e5e5] rounded-xl px-3 py-2">
                <span className="flex-1 text-sm truncate select-all">
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 hover:text-[#990011] transition-colors"
                  title={t.calendar?.copy || "Sao chép"}
                >
                  {copied ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#606060]">
                {t.calendar?.linkExpires || "Liên kết hết hạn sau 7 ngày"}
              </p>
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SharePopover
