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
      const link = document.createElement("a")
      link.href = url
      link.download = `recording-${meetingId || recordingId}-${new Date(createdAt).toISOString().slice(0, 10)}.webm`
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
    <div className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Left: metadata */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Top row: status badge + meeting ID */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : isFailed
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : isFailed
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            />
            {isCompleted
              ? t?.recordings?.status?.completed || "completed"
              : isFailed
                ? t?.recordings?.status?.failed || "failed"
                : status}
          </span>

          {/* Meeting ID */}
          <span className="text-xs text-gray-400 truncate" title={meetingId}>
            {meetingId}
          </span>
        </div>

        {/* Meta row: date, duration, size */}
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
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
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            hasFile
              ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Play className="h-4 w-4" />
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
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            hasFile
              ? "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              : "bg-gray-50 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete?.(recording)}
          title={t?.recordings?.actions?.delete || "Delete recording"}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default RecordingCard
