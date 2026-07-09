import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertTriangle, Film } from "lucide-react"
import { cancelUpload, dismissCompleted, toggleMinimize } from "../../../store/slices/reelUploadSlice"

const ReelUploadProgress = () => {
  const dispatch = useDispatch()
  const {
    isUploading,
    progress,
    title,
    error,
    success,
    showCompleted,
    isMinimized
  } = useSelector((state) => state.reelUpload)

  const isVisible = isUploading || showCompleted || error

  if (!isVisible) return null

  // Circumference for the SVG progress circle: 2 * PI * r (r = 9) => 56.55
  const strokeDashoffset = 56.55 - (progress / 100) * 56.55

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this Reel upload?")) {
      dispatch(cancelUpload())
    }
  }

  const handleClose = () => {
    dispatch(dismissCompleted())
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-4 right-4 z-[9999] font-sans"
      >
        {isMinimized ? (
          /* MINIMIZED PILL VIEW */
          <motion.button
            layoutId="upload-panel"
            onClick={() => dispatch(toggleMinimize())}
            className="flex items-center gap-3 bg-white/95 border border-gray-200/80 shadow-lg hover:shadow-xl rounded-full px-4 py-2.5 cursor-pointer select-none transition-all active:scale-[0.98] focus:outline-none"
          >
            {isUploading && (
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 transform -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    className="stroke-gray-200"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    className="stroke-[#990011]"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray="56.55"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-gray-600 font-mono">
                  {progress}
                </div>
              </div>
            )}

            {success && (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            )}

            {error && (
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
            )}

            <div className="text-xs font-bold text-gray-700 max-w-[150px] truncate">
              {isUploading ? `Uploading: ${progress}%` : success ? "Upload complete" : "Upload failed"}
            </div>
            
            <ChevronUp size={14} className="text-gray-400" />
          </motion.button>
        ) : (
          /* EXPANDED DETAILED CARD VIEW */
          <motion.div
            layoutId="upload-panel"
            className="w-80 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-2xl rounded-2xl p-4 flex flex-col gap-3.5 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-150/70 pb-2">
              <div className="flex items-center gap-2">
                <Film size={16} className={error ? "text-red-500" : success ? "text-emerald-500" : "text-[#990011]"} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {isUploading ? "Uploading Reel" : success ? "Upload Complete" : "Upload Failed"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch(toggleMinimize())}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                  title="Minimize"
                >
                  <ChevronDown size={16} />
                </button>
                {(success || error) && (
                  <button
                    onClick={handleClose}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col gap-3">
              {/* Title */}
              <div className="text-sm font-bold text-gray-800 line-clamp-1 text-left">
                {title || "Untitled Reel"}
              </div>

              {/* Progress & Status Details */}
              {isUploading && (
                <div className="flex flex-col gap-2">
                  {/* Progress Bar Container */}
                  <div className="relative w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/20">
                    <div
                      className="bg-gradient-to-r from-[#990011] to-[#b30018] h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {/* Info Row */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-400">Uploading video files...</span>
                    <span className="text-[#990011] font-mono font-bold">{progress}%</span>
                  </div>
                  {/* Cancel Button */}
                  <button
                    onClick={handleCancel}
                    className="mt-1.5 self-center text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-100/40 rounded-xl px-4 py-1.5 transition-all active:scale-[0.98] w-full text-center focus:outline-none"
                  >
                    Cancel upload
                  </button>
                </div>
              )}

              {success && (
                <div className="flex flex-col items-center gap-2.5 py-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="text-xs text-gray-500 text-center font-medium">
                    Your Reel is posted and live now!
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full mt-1.5 text-xs font-bold text-gray-700 hover:text-gray-800 bg-gray-100 hover:bg-gray-200/80 border border-gray-200/50 rounded-xl py-2 transition-all active:scale-[0.98] text-center focus:outline-none"
                  >
                    Done
                  </button>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center gap-2.5 py-1">
                  <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="text-xs text-red-600 text-center font-semibold max-h-20 overflow-y-auto w-full px-2 scrollbar-thin">
                    {error}
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full mt-1.5 text-xs font-bold text-gray-700 hover:text-gray-800 bg-gray-100 hover:bg-gray-200/80 border border-gray-200/50 rounded-xl py-2 transition-all active:scale-[0.98] text-center focus:outline-none"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ReelUploadProgress
