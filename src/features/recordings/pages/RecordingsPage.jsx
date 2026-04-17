import React, { useState } from "react"
import { Video, RefreshCw, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetMyRecordingsQuery,
  useGetStorageQuery,
  useDeleteRecordingMutation,
} from "@/store/api/recordingsApi"

import StorageBar from "../components/StorageBar"
import RecordingCard from "../components/RecordingCard"
import RecordingPlayer from "../components/RecordingPlayer"
import DeleteRecordingModal from "../components/DeleteRecordingModal"

const RecordingsPage = () => {
  const { t } = useLanguage()

  // ── API queries ──
  const {
    data: recordings = [],
    isLoading: isLoadingRecordings,
    isFetching: isFetchingRecordings,
    error: recordingsError,
    refetch: refetchRecordings,
  } = useGetMyRecordingsQuery()

  const { data: storage, isLoading: isLoadingStorage } = useGetStorageQuery()

  const [deleteRecording, { isLoading: isDeleting }] =
    useDeleteRecordingMutation()

  // ── Local state ──
  const [playerRecording, setPlayerRecording] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Handlers ──
  const handlePlay = (recording) => {
    setPlayerRecording(recording)
  }

  const handleClosePlayer = () => {
    setPlayerRecording(null)
  }

  const handleDeleteClick = (recording) => {
    setDeleteTarget(recording)
  }

  const handleDeleteConfirm = async (recordingId) => {
    try {
      await deleteRecording(recordingId).unwrap()
      toast.success(t?.recordings?.actions?.deleteSuccess || "Recording deleted", { duration: 3000 })
      setDeleteTarget(null)
    } catch (err) {
      const msg = err?.data?.message || t?.recordings?.actions?.deleteFailed || "Failed to delete recording."
      toast.error(msg)
      console.error("[Recordings] Delete error:", err)
    }
  }

  const handleCloseDeleteModal = () => {
    if (!isDeleting) setDeleteTarget(null)
  }

  // ── Render ──
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-red-900">
          {t?.recordings?.title || "Recordings"}
        </h1>
        <button
          onClick={refetchRecordings}
          disabled={isFetchingRecordings}
          title={t?.recordings?.refresh || "Refresh recordings"}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetchingRecordings ? "animate-spin" : ""}`}
          />
          {t?.recordings?.refresh || "Refresh"}
        </button>
      </div>

      {/* Storage bar */}
      <StorageBar
        usedMb={storage?.usedMb ?? 0}
        limitMb={storage?.limitMb ?? 200}
        usagePercent={storage?.usagePercent ?? 0}
        isQuotaExceeded={storage?.isQuotaExceeded ?? false}
        isLoading={isLoadingStorage}
        t={t}
      />

      {/* Recordings list */}
      {isLoadingRecordings ? (
        <RecordingsListSkeleton />
      ) : recordingsError ? (
        <ErrorState onRetry={refetchRecordings} t={t} />
      ) : recordings.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">
            {recordings.length === 1 
              ? (t?.recordings?.list?.count_one || "1 recording") 
              : (t?.recordings?.list?.count_other?.replace("{{count}}", recordings.length) || `${recordings.length} recordings`)}
          </p>
          {recordings.map((rec) => (
            <RecordingCard
              key={rec.recordingId}
              recording={rec}
              onPlay={handlePlay}
              onDelete={handleDeleteClick}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Video player modal */}
      <RecordingPlayer
        open={!!playerRecording}
        onClose={handleClosePlayer}
        recording={playerRecording}
        t={t}
      />

      {/* Delete confirmation modal */}
      <DeleteRecordingModal
        open={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        recording={deleteTarget}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        t={t}
      />
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────

const EmptyState = ({ t }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
      <Video className="h-8 w-8 text-gray-400" />
    </div>
    <h2 className="mt-2 text-lg font-medium text-gray-900">
      {t?.recordings?.list?.emptyTitle || "No recordings yet"}
    </h2>
    <p className="mt-2 text-sm text-gray-500 max-w-sm">
      {t?.recordings?.list?.emptyDescription || "When you record your calls, they will appear here."}
    </p>
  </div>
)

const ErrorState = ({ onRetry, t }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-10 text-center">
    <p className="text-sm text-red-600 mb-3">{t?.recordings?.list?.error || "Failed to load recordings."}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      {t?.recordings?.list?.retry || "Retry"}
    </button>
  </div>
)

const RecordingsListSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-20 rounded-full bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3.5 w-28 rounded bg-gray-200" />
            <div className="h-3.5 w-14 rounded bg-gray-200" />
            <div className="h-3.5 w-16 rounded bg-gray-200" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
)

export default RecordingsPage
