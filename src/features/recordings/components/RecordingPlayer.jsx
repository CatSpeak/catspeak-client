import React from "react"
import Modal from "@/shared/components/ui/Modal"

/**
 * RecordingPlayer — modal video player using the presigned URL.
 *
 * Uses a modal overlay which works well on both desktop and mobile.
 * The presigned URL is passed directly to <video src> — it expires
 * after 60 minutes, so this component should not persist the URL.
 */
const RecordingPlayer = ({ open, onClose, recording, t }) => {
  if (!recording) return null

  const { fileUrl, meetingId, recordingId } = recording

  // In dev, rewrite R2 URLs to go through Vite's proxy to avoid CORS issues.
  const proxyR2Url = (url) => {
    if (!url || import.meta.env.PROD) return url
    try {
      const parsed = new URL(url)
      if (parsed.host.includes("r2.cloudflarestorage.com")) {
        return `/r2${parsed.pathname}${parsed.search}`
      }
    } catch {
      /* pass through */
    }
    return url
  }

  const videoSrc = proxyR2Url(fileUrl)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.recordings?.player?.title || "Recording"}
      className="p-5 max-w-3xl min-[426px]:max-w-3xl max-[425px]:max-w-none max-[425px]:h-full max-[425px]:flex max-[425px]:flex-col w-full p-0"
    >
      <div className="flex flex-col flex-1 h-full">
        {/* Video player container */}
        <div className="flex flex-col flex-1 bg-black overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 max-[425px]:max-h-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {fileUrl ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[70vh] max-[425px]:max-h-full object-contain"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                <p>
                  {t?.recordings?.player?.videoNotAvailable ||
                    "Video file is not available."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-white px-5 py-3 w-full shrink-0">
          <span className="text-xs text-gray-500">
            {meetingId ||
              t?.recordings?.player?.meetingIdFallback?.replace(
                "{{id}}",
                recordingId,
              ) ||
              `Recording #${recordingId}`}
          </span>
          <span className="text-xs text-gray-400">
            {t?.recordings?.player?.urlExpiry || "URL expires in 60 min"}
          </span>
        </div>
      </div>
    </Modal>
  )
}

export default RecordingPlayer
