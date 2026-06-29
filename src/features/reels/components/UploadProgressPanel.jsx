import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cancelReelUpload } from "../utils/uploadManager"
import { removeUpload } from "@/store/slices/reelUploadSlice"

const UploadProgressPanel = () => {
  const dispatch = useDispatch()
  const uploads = useSelector((state) => state.reelUpload.uploads)
  const uploadItems = Object.values(uploads)
  const [isMinimized, setIsMinimized] = useState(false)

  if (uploadItems.length === 0) return null

  const activeItems = uploadItems.filter(
    (item) => item.status === "uploading"
  )
  const completedItems = uploadItems.filter(
    (item) => item.status === "success"
  )
  const failedItems = uploadItems.filter(
    (item) => item.status === "failed"
  )
  const isFinished = activeItems.length === 0

  // Calculate cumulative progress
  const totalUploadedSize = uploadItems.reduce(
    (sum, item) => sum + (item.progress * item.size) / 100,
    0
  )
  const totalSize = uploadItems.reduce((sum, item) => sum + item.size, 0)
  const overallProgress =
    totalSize > 0 ? Math.round((totalUploadedSize / totalSize) * 100) : 0

  const handleClearFinished = () => {
    uploadItems.forEach((item) => {
      if (item.status === "success" || item.status === "failed") {
        dispatch(removeUpload(item.id))
      }
    })
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] bg-white border border-gray-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[9999] overflow-hidden flex flex-col transition-all duration-300">
      {/* Widget Header */}
      <div
        className="bg-[#1A1A1A] text-white px-4 py-3.5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          {!isFinished && (
            <Loader2 size={16} className="animate-spin text-[#990011]" />
          )}
          <span className="font-semibold text-xs tracking-wide uppercase">
            {isFinished
              ? `Uploaded ${completedItems.length} Reel${
                  completedItems.length !== 1 ? "s" : ""
                }`
              : `Uploading Reels (${overallProgress}%)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white transition-colors focus:outline-none">
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {isFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearFinished()
              }}
              className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              title="Clear all"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Global Progress Bar */}
      {!isFinished && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-[#990011] h-1 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}

      {/* Panel List Details */}
      {!isMinimized && (
        <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100 bg-[#FAF9F9]">
          {uploadItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              {/* Cover thumbnail preview */}
              {item.coverUrl && (
                <img
                  src={item.coverUrl}
                  alt="Thumbnail"
                  className="w-12 h-16 rounded-lg object-cover mr-3 bg-gray-100 border border-gray-100 flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0 mr-3">
                <p
                  className="text-xs font-semibold text-gray-800 truncate"
                  title={item.title}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 font-medium">
                    {(item.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <span className="text-[10px] font-bold text-gray-700">
                    {item.status === "uploading" && `${item.progress}%`}
                    {item.status === "success" && "Uploaded"}
                    {item.status === "failed" && "Failed"}
                  </span>
                </div>

                {/* Sub-Progress Bar */}
                {item.status === "uploading" && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2.5">
                    <div
                      className="bg-[#990011] h-1 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "failed" && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold truncate">
                    {item.error || "Upload failed."}
                  </p>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex items-center flex-shrink-0">
                {item.status === "uploading" ? (
                  <button
                    onClick={() => cancelReelUpload(item.id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors focus:outline-none"
                    title="Cancel upload"
                  >
                    <X size={16} />
                  </button>
                ) : item.status === "success" ? (
                  <span className="text-[#990011] bg-red-50 p-1.5 rounded-full">
                    <CheckCircle2 size={16} />
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 bg-red-50 p-1.5 rounded-full">
                      <AlertCircle size={16} />
                    </span>
                    <button
                      onClick={() => dispatch(removeUpload(item.id))}
                      className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors focus:outline-none"
                      title="Clear"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UploadProgressPanel
