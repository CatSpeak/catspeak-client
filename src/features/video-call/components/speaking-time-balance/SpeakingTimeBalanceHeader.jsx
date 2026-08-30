import React from "react"
import { X, RotateCw } from "lucide-react"

/**
 * SpeakingTimeBalanceHeader Component
 * Renders panel title, real-time seconds-ago ticker, manual refresh action, and close button.
 */
const SpeakingTimeBalanceHeader = ({
  title,
  secondsAgo = 0,
  isLoading = false,
  isError = false,
  isFetching = false,
  onRefresh,
  onClose,
  labels = {},
}) => {
  return (
    <div className="border-b border-[#E5E5E5] px-4 py-3 shrink-0 relative bg-white">
      {/* Red accent bar on top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cath-red-700" />

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-[17px] text-gray-900 leading-tight">
            {title || labels.title || "Speaking Time Balance"}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-normal">
            {isLoading ? (
              <span>{labels.loading || "Đang tải..."}</span>
            ) : isError ? (
              <span className="text-gray-400">{labels.unableToLoad || "Không thể tải"}</span>
            ) : (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 hover:text-gray-700 transition-colors text-left"
                title="Cập nhật lại thống kê"
              >
                <RotateCw
                  size={12}
                  className={`text-gray-400 shrink-0 ${
                    isFetching ? "animate-spin text-cath-red-700" : ""
                  }`}
                />
                <span>
                  {(labels.updatedSecondsAgo || "Cập nhật {seconds} giây trước").replace(
                    "{seconds}",
                    String(secondsAgo),
                  )}
                </span>
              </button>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mr-1 -mt-0.5"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default SpeakingTimeBalanceHeader
