import React from "react"
import { Share2, Copy, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
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
  const { shareRef, sharePopoverOpen, shareUrl, isSharing, handleShare } =
    useEventShare(eventId, occurrenceId)

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success(t.calendar?.copied || "Đã sao chép liên kết")
      })
    }
  }

  return (
    <div ref={shareRef}>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors shrink-0 flex items-center justify-center rounded-full w-12 h-12 disabled:opacity-50"
        title={t.calendar?.shareEvent || "Chia sẻ sự kiện"}
      >
        {isSharing ? <Loader2 className="animate-spin" /> : <Share2 />}
      </button>

      <AnimatePresence>
        {sharePopoverOpen && shareUrl && (
          <FluentAnimation
            direction="up"
            exit
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none min-[426px]:absolute min-[426px]:inset-auto min-[426px]:bottom-14 min-[426px]:right-0 min-[426px]:block"
          >
            <div className="w-[calc(100vw-2rem)] min-[426px]:w-80 bg-white border rounded-2xl shadow-xl p-6 pointer-events-auto">
              <p className="mb-3">
                {t.calendar?.shareLink || "Chia sẻ liên kết"}
              </p>

              <div className="mb-3 h-12 flex items-center gap-2 border border-[#d3d3d3] rounded-2xl px-4 py-2">
                <span className="flex-1 truncate select-all">{shareUrl}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 hover:text-[#990011] transition-colors"
                  title={t.calendar?.copy || "Sao chép"}
                >
                  <Copy />
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
