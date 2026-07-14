import React, { useCallback, useMemo, useState } from "react"
import { Film, Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useDeleteReelMutation, useGetUserReelsQuery } from "@/store/api/reelsApi"

import StatCard from "../cards/StatCard"
import WorkspaceReelListItem from "../grid/WorkspaceReelListItem"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"

const PAGE_SIZE = 10
const EMPTY_REELS = []

const WorkspaceMyReelsTab = ({ userId, formatDate, formatNumber, navigate, setIsUploadOpen }) => {
  const { t } = useLanguage()
  const ws = t?.catSpeak?.reels?.workspace || {}

  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isFetching, error } = useGetUserReelsQuery(
    { userId, page, pageSize: PAGE_SIZE },
    { skip: !userId }
  )
  const [deleteReel, { isLoading: isDeleting }] = useDeleteReelMutation()

  const reels = data?.data || EMPTY_REELS
  const hasMore = (data?.lastPageCount || 0) >= PAGE_SIZE

  const stats = useMemo(
    () => reels.reduce(
      (acc, reel) => ({
        views: acc.views + (reel.viewCount || 0),
        likes: acc.likes + (reel.likesCount || 0),
      }),
      { views: 0, likes: 0 }
    ),
    [reels]
  )

  const handlePlay = useCallback((reel) => {
    navigate(`${reel.reelId}`)
  }, [navigate])

  const handleDeleteClick = useCallback((reel) => {
    setDeleteTarget(reel)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    const loadingToastId = toast.loading(ws?.deleting || "Deleting Reel...")
    try {
      await deleteReel(deleteTarget.reelId).unwrap()
      toast.success(ws?.deleteSuccess || "Reel deleted successfully!", { id: loadingToastId })
      setDeleteTarget(null)
    } catch (err) {
      console.error("[Workspace Reels] Delete error:", err)
      toast.error(err?.data?.message || ws?.deleteFailed || "Failed to delete reel.", { id: loadingToastId })
    }
  }, [deleteReel, deleteTarget, ws])

  const reelsUploadedLabel = reels.length === 1
    ? (ws?.reelUploadedSingular || "1 reel uploaded")
    : (ws?.reelsUploaded || "{{count}} reels uploaded").replace("{{count}}", formatNumber(reels.length))

  return (
    <>
      {reels.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label={ws?.totalReels || "Total Reels"} value={formatNumber(reels.length)} />
          <StatCard label={ws?.totalViews || "Total Views"} value={formatNumber(stats.views)} />
          <StatCard label={ws?.totalLikes || "Total Likes"} value={formatNumber(stats.likes)} />
        </div>
      )}

      {isLoading && page === 1 ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3.5 bg-gray-200 rounded w-64" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : error && page === 1 ? (
        <ErrorMessage message={error?.data?.message || "Failed to load reels. Please try again."} />
      ) : reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <Film size={48} className="text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">{ws?.noReels || "No reels uploaded yet"}</h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
            {ws?.noReelsDesc || "Share your knowledge, tutorials, or highlights by uploading your first short video!"}
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-cath-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cath-red-600 transition-colors flex items-center space-x-1 text-sm shadow"
          >
            <Plus size={16} />
            <span>{ws?.uploadFirst || "Upload First Reel"}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-textColor mb-1">{reelsUploadedLabel}</p>

          {reels.map((reel) => (
            <WorkspaceReelListItem
              key={reel.reelId}
              reel={reel}
              formatDate={formatDate}
              formatNumber={formatNumber}
              onDeleteClick={handleDeleteClick}
              onPlay={handlePlay}
            />
          ))}

          {hasMore && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={isFetching}
                className="rounded-full bg-blue-50 px-6 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
              >
                {isFetching ? "..." : t.seeMore || "See more"}
              </button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100 flex flex-col text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{ws?.deleteTitle || "Delete Reel?"}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {ws?.deleteConfirm || "Are you sure you want to delete"} <strong className="text-gray-700">"{deleteTarget.title}"</strong>? {ws?.deleteWarning || "This action is permanent and cannot be undone."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                {ws?.cancelBtn || "Cancel"}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-1"
              >
                {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                <span>{ws?.deleteBtn || "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WorkspaceMyReelsTab
