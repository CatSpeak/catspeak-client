import React from "react"
import { Share2, Copy, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "react-hot-toast"
import { AnimatePresence } from "framer-motion"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import useEventShare from "../../hooks/useEventShare"
import { useLanguage } from "@/shared/context/LanguageContext"

const VARIANT_CLASSES = {
  default: "bg-primaryBg dark:bg-[#272727] hover:bg-[#D9D9D9] dark:hover:bg-[#3D3D3D]",
  onPrimary: "bg-white/20 hover:bg-white/30 text-white",
  ghost: "text-[#990011] dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#272727]",
  outline:
    "bg-transparent border border-border dark:border-[#3F3F3F] text-[#1A1A1A] dark:text-white hover:bg-gray-50 dark:hover:bg-[#272727]",
  action:
    "bg-primaryBg dark:bg-[#272727] hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-neutral-200 rounded-xl px-4 py-2 sm:py-2.5 text-xs font-medium gap-1.5",
}

const SIZE_CLASSES = {
  md: "w-12 h-12",
  sm: "w-10 h-10",
}

/**
 * Self-contained share button with a popover that shows the generated link,
 * a QR code, and a copy-to-clipboard action. PUBLIC events share a direct URL;
 * SHARED_LINK_ONLY events use a creator-issued token link.
 */
const SharePopover = ({
  eventId,
  occurrenceId,
  visibilityScope,
  isCreator,
  languageCommunity,
  variant = "default",
  size = "md",
  label,
  placement = "top",
}) => {
  const { t } = useLanguage()
  const {
    shareRef,
    sharePopoverOpen,
    shareUrl,
    errorMessage,
    isSharing,
    isDisabled,
    handleShare,
  } = useEventShare({
    eventId,
    occurrenceId,
    visibilityScope,
    isCreator,
    languageCommunity,
  })

  const isAction = variant === "action"

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t.calendar?.copied || "Đã sao chép liên kết")
    } catch (err) {
      console.error("Failed to copy share link:", err)
      toast.error(
        t.calendar?.copyFailed || "Không thể sao chép liên kết.",
      )
    }
  }

  return (
    <div
      ref={shareRef}
      className={isAction ? "relative flex flex-1" : "relative"}
    >
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`${VARIANT_CLASSES[variant] || VARIANT_CLASSES.default} ${
          isAction
            ? "w-full"
            : `${SIZE_CLASSES[size] || SIZE_CLASSES.md} rounded-full`
        } transition-colors shrink-0 flex items-center justify-center disabled:opacity-50 ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={
          isDisabled
            ? t.calendar?.shareCreatorOnly ||
              "Chỉ người tạo sự kiện mới có thể tạo liên kết chia sẻ."
            : t.calendar?.shareEvent || "Chia sẻ sự kiện"
        }
      >
        {isSharing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Share2
            size={isAction ? 14 : undefined}
            className={isAction ? "shrink-0" : undefined}
          />
        )}
        {label ? <span className="truncate">{label}</span> : null}
      </button>

      <AnimatePresence>
        {sharePopoverOpen && (shareUrl || errorMessage) && (
          <FluentAnimation
            direction="up"
            exit
            className={`fixed inset-0 flex items-center justify-center z-[60] pointer-events-none min-[426px]:absolute min-[426px]:inset-auto min-[426px]:block min-[426px]:right-0 ${
              placement === "bottom"
                ? "min-[426px]:top-14"
                : "min-[426px]:bottom-14"
            }`}
          >
            <div className="w-[calc(100vw-2rem)] min-[426px]:w-80 bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] rounded-2xl shadow-xl p-6 pointer-events-auto text-gray-900 dark:text-white">
              <p className="mb-3">
                {t.calendar?.shareLink || "Chia sẻ liên kết"}
              </p>

              {errorMessage ? (
                <p className="text-sm text-[#B81919] dark:text-red-400">{errorMessage}</p>
              ) : (
                <>
                  <div className="mb-3 flex justify-center p-2 bg-white rounded-xl">
                    <QRCodeSVG value={shareUrl} size={160} />
                  </div>

                  <div className="mb-3 h-12 flex items-center gap-2 border border-[#d3d3d3] dark:border-[#3F3F3F] bg-white dark:bg-[#272727] rounded-2xl px-4 py-2">
                    <span className="flex-1 truncate select-all">{shareUrl}</span>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 hover:text-cath-red-700 dark:hover:text-red-400 transition-colors"
                      title={t.calendar?.copy || "Sao chép"}
                    >
                      <Copy />
                    </button>
                  </div>

                  <p className="text-xs text-[#606060] dark:text-neutral-400">
                    {t.calendar?.linkExpires || "Liên kết hết hạn sau 7 ngày"}
                  </p>
                </>
              )}
            </div>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SharePopover
