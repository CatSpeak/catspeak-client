import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { Calendar, Clock, HardDrive, Video } from "lucide-react"

/**
 * RecordingPlayerModal — Trình phát video bài giảng cho lớp học
 */
const RecordingPlayerModal = ({ open, onClose, recording }) => {
  if (!recording) return null

  const {
    title,
    sessionNumber,
    sessionDate,
    videoUrl,
    durationSeconds,
    fileSizeBytes,
    isPublished,
  } = recording

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "N/A"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}h ${m}m ${s > 0 ? `${s}s` : ""}`
    }
    return `${m}m ${s}s`
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return "N/A"
    const mb = bytes / (1024 * 1024)
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb.toFixed(1)} MB`
  }

  const displayTitle =
    title ||
    (sessionNumber
      ? `Buổi ${sessionNumber}${sessionDate ? ` - ${sessionDate}` : ""}`
      : "Video bài giảng")

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={displayTitle}
      className="md:max-w-4xl"
      bodyClassName="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col gap-4"
    >
      {/* Video Container */}
      <div className="relative w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center min-h-[340px] max-h-[70vh] shadow-inner">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[70vh] object-contain"
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-8 text-center">
            <Video className="w-12 h-12 text-gray-500 opacity-60" />
            <p className="text-sm">Đường dẫn video hiện không khả dụng.</p>
          </div>
        )}
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-neutral-50 dark:bg-[#222222] rounded-xl border border-neutral-100 dark:border-[#3F3F3F] text-xs sm:text-sm text-[#4b5563] dark:text-gray-300">
        <div className="flex flex-wrap items-center gap-4">
          {sessionNumber != null && (
            <span className="font-semibold text-neutral-900 dark:text-white bg-white dark:bg-[#1A1A1A] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-[#3F3F3F] shadow-xs">
              Buổi {sessionNumber}
            </span>
          )}

          {sessionDate && (
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{sessionDate}</span>
            </div>
          )}

          {durationSeconds != null && durationSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>{formatDuration(durationSeconds)}</span>
            </div>
          )}

          {fileSizeBytes != null && fileSizeBytes > 0 && (
            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-gray-300">
              <HardDrive className="w-4 h-4 text-neutral-400" />
              <span>{formatFileSize(fileSizeBytes)}</span>
            </div>
          )}
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPublished
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
          }`}
        >
          {isPublished ? "Đã đăng lên giảng đường" : "Bản nháp (Chưa đăng)"}
        </span>
      </div>
    </Modal>
  )
}

export default RecordingPlayerModal
