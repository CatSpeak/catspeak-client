import React, { memo, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Calendar, Eye, Film, Heart, Play, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useDeleteReelMutation, useGetUserReelsQuery } from "@/store/api/reelsApi"

import CreateReelModal from "../components/CreateReelModal"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"

const PAGE_SIZE = 10
const EMPTY_REELS = []

const getLocale = (lang) => {
  if (lang === "zh") return "zh-CN"
  if (lang === "vi") return "vi-VN"
  return "en-US"
}

const StatCard = memo(function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm flex flex-col">
      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
      <span className="text-xl font-extrabold text-gray-800 mt-1">{value}</span>
    </div>
  )
})

const WorkspaceReelListItem = memo(function WorkspaceReelListItem({
  reel,
  formatDate,
  formatNumber,
  onDeleteClick,
  onPlay,
}) {
  const handleOpen = useCallback(() => {
    onPlay(reel)
  }, [onPlay, reel])

  const handlePlayClick = useCallback((event) => {
    event.stopPropagation()
    onPlay(reel)
  }, [onPlay, reel])

  const handleDeleteClick = useCallback((event) => {
    event.stopPropagation()
    onDeleteClick(reel)
  }, [onDeleteClick, reel])

  return (
    <div
      onClick={handleOpen}
      className="group flex flex-col gap-3 rounded-lg border border-[#e5e5e5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        {reel.coverUrl ? (
          <img
            src={reel.coverUrl}
            alt={reel.title}
            loading="lazy"
            className="w-16 h-16 rounded object-cover flex-shrink-0 bg-gray-100 border border-gray-200 group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="w-16 h-16 rounded flex items-center justify-center bg-gray-50 border border-gray-100 flex-shrink-0 text-gray-400">
            <Film size={24} />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-800 truncate text-sm sm:text-base">
            {reel.title}
          </span>
          {reel.description && (
            <p className="text-xs text-[#606060] truncate max-w-[280px] sm:max-w-md md:max-w-lg mt-0.5">
              {reel.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-[#808080] mt-1.5 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(reel.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(reel.viewCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {formatNumber(reel.likesCount || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
        <button
          onClick={handlePlayClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2F2] hover:bg-[#D9D9D9] transition-colors"
          title="Watch Reel"
          aria-label="Watch reel"
        >
          <Play size={18} className="text-gray-700" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2F2] hover:bg-[#ffdede] hover:text-red-600 text-gray-700 transition-colors"
          title="Delete Reel"
          aria-label="Delete reel"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
})

const WorkspaceReelsContent = ({ userId }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const currentLang = localStorage.getItem("communityLanguage") || "en"
  const locale = getLocale(currentLang)

  const [page, setPage] = useState(1)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isFetching, error } = useGetUserReelsQuery(
    { userId, page, pageSize: PAGE_SIZE },
    { skip: !userId }
  )
  const [deleteReel, { isLoading: isDeleting }] = useDeleteReelMutation()

  const reels = data?.data || EMPTY_REELS
  const hasMore = (data?.lastPageCount || 0) >= PAGE_SIZE

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    [locale]
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime()) ? dateStr : dateFormatter.format(date)
  }, [dateFormatter])

  const formatNumber = useCallback(
    (value) => numberFormatter.format(value || 0),
    [numberFormatter]
  )

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
    navigate(`/workspace/reels/${reel.reelId}`)
  }, [navigate])

  const handleDeleteClick = useCallback((reel) => {
    setDeleteTarget(reel)
  }, [])

  const handleUploadClose = useCallback(() => {
    setIsUploadOpen(false)
    setPage(1)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    const loadingToastId = toast.loading("Deleting Reel...")
    try {
      await deleteReel(deleteTarget.reelId).unwrap()
      toast.success("Reel deleted successfully!", { id: loadingToastId })
      setDeleteTarget(null)
    } catch (err) {
      console.error("[Workspace Reels] Delete error:", err)
      toast.error(err?.data?.message || "Failed to delete reel.", { id: loadingToastId })
    }
  }, [deleteReel, deleteTarget])

  return (
    <div className="flex flex-col gap-5 text-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-900">
          {t.catSpeak?.reels?.title || "Reels"}
        </h1>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#990011] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#80000e] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1 text-sm"
        >
          <Plus size={16} />
          <span>{t.catSpeak?.reels?.uploadReel || "Upload Reel"}</span>
        </button>
      </div>

      {reels.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Reels" value={formatNumber(reels.length)} />
          <StatCard label="Total Views" value={formatNumber(stats.views)} />
          <StatCard label="Total Likes" value={formatNumber(stats.likes)} />
        </div>
      )}

      {isLoading && page === 1 ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex flex-col gap-3 rounded-lg border border-[#e5e5e5] bg-white p-4 shadow-sm animate-pulse sm:flex-row sm:items-center sm:justify-between"
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
          <h3 className="font-bold text-gray-700 mb-1">No reels uploaded yet</h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
            Share your knowledge, tutorials, or highlights by uploading your first short video!
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-[#990011] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#80000e] transition-colors flex items-center space-x-1 text-sm shadow"
          >
            <Plus size={16} />
            <span>Upload First Reel</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-[#606060] mb-1">
            {reels.length === 1 ? "1 reel uploaded" : `${formatNumber(reels.length)} reels uploaded`}
          </p>

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

      {isUploadOpen && (
        <CreateReelModal open={isUploadOpen} onClose={handleUploadClose} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100 flex flex-col text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Reel?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong className="text-gray-700">"{deleteTarget.title}"</strong>? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-1"
              >
                {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const WorkspaceReelsPage = () => {
  const { user } = useAuth()
  const userId = user?.accountId

  return <WorkspaceReelsContent key={userId || "anonymous"} userId={userId} />
}

export default WorkspaceReelsPage
