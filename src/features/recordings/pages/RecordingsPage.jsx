import React, { useState } from "react"
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
import RecordingsEmptyState from "../components/RecordingsEmptyState"
import RecordingsErrorState from "../components/RecordingsErrorState"
import RecordingsListSkeleton from "../components/RecordingsListSkeleton"

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
      toast.success(
        t?.recordings?.actions?.deleteSuccess || "Recording deleted",
        { duration: 3000 },
      )
      setDeleteTarget(null)
    } catch (err) {
      const msg =
        err?.data?.message ||
        t?.recordings?.actions?.deleteFailed ||
        "Failed to delete recording."
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
      <h1 className="text-xl font-bold text-red-900">
        {t?.recordings?.title || "Recordings"}
      </h1>

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
        <RecordingsErrorState onRetry={refetchRecordings} t={t} />
      ) : recordings.length === 0 ? (
        <RecordingsEmptyState t={t} />
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[#606060]">
            {recordings.length === 1
              ? t?.recordings?.list?.count_one || "1 recording"
              : t?.recordings?.list?.count_other?.replace(
                  "{{count}}",
                  recordings.length,
                ) || `${recordings.length} recordings`}
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

export default RecordingsPage
