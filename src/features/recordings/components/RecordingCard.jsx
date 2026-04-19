import React from "react"
import {
  Play,
  Download,
  Trash2,
  Clock,
  HardDrive,
  Calendar,
  AlertCircle,
} from "lucide-react"
import {
  formatDuration,
  formatFileSize,
  formatDate,
} from "../utils/formatUtils"

/**
 * RecordingCard — displays a single recording with metadata and action buttons.
 */
const RecordingCard = ({ recording, onPlay, onDelete, t }) => {
  const {
    recordingId,
    meetingId,
    status,
    fileUrl,
    fileSizeBytes,
    durationSeconds,
    createdAt,
  } = recording

  console.log(recording)

  const isCompleted = status === "completed"
  const isFailed = status === "failed"
  const hasFile = isCompleted && fileUrl

  // In dev, rewrite R2 URLs to go through Vite's proxy to avoid CORS issues.
  // e.g. https://<account>.r2.cloudflarestorage.com/bucket/path → /r2/bucket/path
  const proxyR2Url = (url) => {
    if (!url || import.meta.env.PROD) return url
    try {
      const parsed = new URL(url)
      if (parsed.host.includes("r2.cloudflarestorage.com")) {
        return `/r2${parsed.pathname}${parsed.search}`
      }
    } catch {
      /* not a valid URL, pass through */
    }
    return url
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    if (!fileUrl) return

    const fetchUrl = proxyR2Url(fileUrl)

    // ── Debug: parse the pre-signed URL ──────────────────────────────
    try {
      const parsed = new URL(fileUrl)
      console.group("[Recording Debug] Download attempt")
      console.log("Original URL:", fileUrl)
      console.log("Fetch URL:", fetchUrl)
      console.log("Host:", parsed.host)
      console.log("Object key (pathname):", parsed.pathname)
      console.log("Recording metadata:", {
        recordingId,
        meetingId,
        status,
        fileSizeBytes,
        durationSeconds,
        createdAt,
      })
      console.groupEnd()
    } catch {
      console.warn("[Recording Debug] Could not parse fileUrl:", fileUrl)
    }

    try {
      const response = await fetch(fetchUrl)

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(
          `[Recording Debug] Fetch failed: ${response.status} ${response.statusText}`,
        )
        console.error("[Recording Debug] Response body:", errorBody)
        window.open(fileUrl, "_blank")
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      let extension = "mp4" // Fallback extension
      try {
        const match = new URL(fileUrl).pathname.match(/\.([a-z0-9]+)$/i)
        if (match) extension = match[1]
      } catch (e) {
        console.warn("[Recording] Could not extract extension from fileUrl")
      }

      const link = document.createElement("a")
      link.href = url
      link.download = `recording-${meetingId || recordingId}-${new Date(createdAt).toISOString().slice(0, 10)}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("[Recording Debug] Network error:", err.message)
      // Fallback: open in new tab
      window.open(fileUrl, "_blank")
    }
  }

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-[#e5e5e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: metadata */}
      <div className="flex flex-col">
        {/* Top row: meeting ID */}
        <span
          className="text-base text-red-900 font-semibold"
          title={meetingId}
        >
          {meetingId}
        </span>

        {/* Meta row: date, duration, size */}
        <div className="flex items-center gap-4 text-sm text-[#606060] flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5" />
            {formatFileSize(fileSizeBytes)}
          </span>
        </div>

        {/* File unavailable warning */}
        {isCompleted && !fileUrl && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              {t?.recordings?.list?.fileUnavailable ||
                "File unavailable — recording may still be processing"}
            </span>
          </div>
        )}
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Play */}
        <button
          onClick={() => hasFile && onPlay?.(recording)}
          disabled={!hasFile}
          title={
            hasFile
              ? t?.recordings?.actions?.play || "Play recording"
              : t?.recordings?.actions?.playUnavailable || "File not available"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            hasFile
              ? "bg-[#F2F2F2] hover:bg-[#D9D9D9]"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Play className="h-5 w-5" />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={!hasFile}
          title={
            hasFile
              ? t?.recordings?.actions?.download || "Download recording"
              : t?.recordings?.actions?.downloadUnavailable ||
                "File not available"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            hasFile
              ? "bg-[#F2F2F2] hover:bg-[#D9D9D9]"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Download className="h-5 w-5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete?.(recording)}
          title={t?.recordings?.actions?.delete || "Delete recording"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default RecordingCard
