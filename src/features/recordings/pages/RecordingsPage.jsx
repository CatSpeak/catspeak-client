import React, { useState } from "react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import {
  useGetMyRecordingsQuery,
  useGetStorageQuery,
  useDeleteRecordingMutation,
} from "@/store/api/recordingsApi"

import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PlanRequiredState } from "@/shared/components/ui/indicators"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import StorageBar from "../components/StorageBar"
import RecordingCard from "../components/RecordingCard"
import RecordingPlayer from "../components/RecordingPlayer"
import RecordingsEmptyState from "../components/RecordingsEmptyState"
import RecordingsErrorState from "../components/RecordingsErrorState"
import RecordingsListSkeleton from "../components/RecordingsListSkeleton"

const RecordingsPage = () => {
  const { t } = useLanguage()
  const { limits, isLoading: isPlanLoading } = usePlanFeatures()

  const canRecord = limits.allowRecording

  // ── API queries ──
  const {
    data: recordings = [],
    isLoading: isLoadingRecordings,
    error: recordingsError,
    refetch: refetchRecordings,
  } = useGetMyRecordingsQuery(undefined, { skip: isPlanLoading || !canRecord })

  const { data: storage, isLoading: isLoadingStorage } = useGetStorageQuery(
    undefined,
    { skip: isPlanLoading || !canRecord },
  )

  const [deleteRecording, { isLoading: isDeleting }] =
    useDeleteRecordingMutation()

  // ── Local state ──
  const [playerRecording, setPlayerRecording] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Calculated Storage Limits ──
  const planLimitMb = limits.maxRecordingStorageMb ?? limits.maxStorageMb
  const maxStorageMb =
    planLimitMb !== undefined && planLimitMb !== null && planLimitMb > 0
      ? planLimitMb
      : (storage?.limitMb ?? 0)
  const usedMb = storage?.usedMb ?? 0
  const usagePercent =
    maxStorageMb > 0
      ? Math.min(100, Math.round((usedMb / maxStorageMb) * 100))
      : 0
  const isQuotaExceeded = maxStorageMb > 0 ? usedMb >= maxStorageMb : false

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

  // ── Early return for Plan Requirement ──
  if (!isPlanLoading && !canRecord) {
    return (
      <PlanRequiredState
        pageTitle={t?.recordings?.title || "Recordings"}
        subtext={
          t?.recordings?.planRequired ||
          "Call recording requires a plan with recording privileges. Upgrade to CatSpeak Pro to record calls and manage your recordings!"
        }
        featureName="Recordings"
        animationKey="recordings-plan-required"
      />
    )
  }

  // ── Render ──
  return (
    <>
      {/* Video player modal */}
      <RecordingPlayer
        open={!!playerRecording}
        onClose={handleClosePlayer}
        recording={playerRecording}
        t={t}
      />

      {/* Delete confirmation modal */}
      <ConfirmationModal
        open={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={() => deleteTarget && handleDeleteConfirm(deleteTarget.recordingId)}
        title={t?.recordings?.deleteModal?.title || "Delete Recording?"}
        cancelText={t?.recordings?.deleteModal?.cancel || "Cancel"}
        confirmText={t?.recordings?.deleteModal?.confirm || "Delete"}
        confirmVariant="destructive"
        isPending={isDeleting}
      >
        {deleteTarget && (
          <p>
            {t?.recordings?.deleteModal?.description || "This will permanently delete the recording"}
            {deleteTarget.meetingId && (
              <span className="font-semibold text-gray-900">
                {" "}{deleteTarget.meetingId}
              </span>
            )}
            {deleteTarget.fileSizeBytes > 0 && (
              <span className="font-medium text-gray-700">
                {" "}({(deleteTarget.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)
              </span>
            )}
            . {t?.recordings?.deleteModal?.cannotUndo || "This action cannot be undone."}
          </p>
        )}
      </ConfirmationModal>

      <AnimatePresence mode="wait">
        <FluentAnimation
          animationKey="recordings-page"
          direction="up"
          className="w-full flex flex-col gap-6"
        >
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageTitle>{t?.recordings?.title || "Recordings"}</PageTitle>
          </div>

          {/* Storage bar inside FluentCard */}
          <FluentCard>
            <StorageBar
              usedMb={usedMb}
              limitMb={maxStorageMb}
              usagePercent={usagePercent}
              isQuotaExceeded={isQuotaExceeded}
              isLoading={isLoadingStorage || isPlanLoading}
              t={t}
            />
          </FluentCard>

          {/* Recordings list */}
          {isLoadingRecordings ? (
            <RecordingsListSkeleton />
          ) : recordingsError ? (
            <RecordingsErrorState onRetry={refetchRecordings} t={t} />
          ) : recordings.length === 0 ? (
            <RecordingsEmptyState t={t} />
          ) : (
            <div className="flex flex-col">
              <p className="text-sm font-medium text-[#606060] mb-2">
                {recordings.length === 1
                  ? t?.recordings?.list?.count_one || "1 recording"
                  : t?.recordings?.list?.count_other?.replace(
                      "{{count}}",
                      recordings.length,
                    ) || `${recordings.length} recordings`}
              </p>

              <div className="space-y-1">
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
            </div>
          )}
        </FluentAnimation>
      </AnimatePresence>
    </>
  )
}

export default RecordingsPage
