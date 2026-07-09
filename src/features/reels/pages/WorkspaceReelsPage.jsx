import React, { useCallback, useMemo, useState } from "react"
import { useNavigate, Outlet, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Calendar, Eye, Film, Heart, Play, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { 
  useDeleteReelMutation, 
  useGetUserReelsQuery,
  useGetPlaylistsQuery,
  useCreatePlaylistMutation,
  useGetBookmarkedReelsQuery
} from "@/store/api/reelsApi"

import ReelCard from "../components/cards/ReelCard"
import CreateReelModal from "../components/modals/CreateReelModal"
import ErrorMessage from "@/shared/components/ui/indicators/ErrorMessage"
import StatCard from "../components/cards/StatCard"
import WorkspaceReelListItem from "../components/grid/WorkspaceReelListItem"

const PAGE_SIZE = 10
const EMPTY_REELS = []

const getLocale = (lang) => {
  if (lang === "zh") return "zh-CN"
  if (lang === "vi") return "vi-VN"
  return "en-US"
}


const WorkspaceReelsContent = ({ userId }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const currentLang = localStorage.getItem("communityLanguage") || "en"
  const locale = getLocale(currentLang)

  const [page, setPage] = useState(1)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [activeSection, setActiveSection] = useState("my-reels") // "my-reels" | "bookmarks"
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("") // "" means All
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)

  // My Reels Queries
  const { data, isLoading, isFetching, error } = useGetUserReelsQuery(
    { userId, page, pageSize: PAGE_SIZE },
    { skip: !userId || activeSection !== "my-reels" }
  )
  const [deleteReel, { isLoading: isDeleting }] = useDeleteReelMutation()

  // Playlists Query
  const { data: playlists = [], isLoading: isPlaylistsLoading } = useGetPlaylistsQuery(undefined, {
    skip: activeSection !== "bookmarks"
  })
  const [createPlaylist] = useCreatePlaylistMutation()

  // Bookmarks Query
  const { data: bookmarkedResponse, isLoading: isBookmarksLoading, error: bookmarksError } = useGetBookmarkedReelsQuery(
    selectedPlaylistId || undefined,
    { skip: activeSection !== "bookmarks" }
  )

  const reels = data?.data || EMPTY_REELS
  const bookmarkedReels = bookmarkedResponse?.data || EMPTY_REELS
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

  const { id } = useParams()

  const handlePlay = useCallback((reel) => {
    navigate(`${reel.reelId}`)
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

  const handleCreatePlaylistSubmit = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return
    try {
      await createPlaylist(newPlaylistName.trim()).unwrap()
      setNewPlaylistName("")
      setShowCreatePlaylist(false)
      toast.success("Đã tạo danh sách phát!")
    } catch (err) {
      toast.error(err?.data?.message || "Lỗi tạo danh sách phát.")
    }
  }

  return (
    <div className="flex flex-col gap-5 text-gray-800">
      {!id && (
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-900">
            {t.catSpeak?.reels?.title || "Reels"}
          </h1>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-cath-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-cath-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1 text-sm border-none cursor-pointer outline-none"
          >
            <Plus size={16} />
            <span>{t.catSpeak?.reels?.uploadReel || "Upload Reel"}</span>
          </button>
        </div>
      )}

      {id ? (
        <Outlet />
      ) : (
        <>
          {/* Section Selector Tab Header */}
          <div className="flex border-b border-gray-200 mb-2 gap-6 shrink-0">
            <button
              onClick={() => setActiveSection("my-reels")}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 px-1 bg-transparent cursor-pointer outline-none border-none ${
                activeSection === "my-reels"
                  ? "border-b-cath-red-700 border-b-2 text-cath-red-700"
                  : "border-b-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Video của tôi
            </button>
            <button
              onClick={() => setActiveSection("bookmarks")}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 px-1 bg-transparent cursor-pointer outline-none border-none ${
                activeSection === "bookmarks"
                  ? "border-b-cath-red-700 border-b-2 text-cath-red-700"
                  : "border-b-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Bộ sưu tập & Danh sách phát
            </button>
          </div>

          {activeSection === "my-reels" ? (
            <>
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
                  <h3 className="font-bold text-gray-700 mb-1">No reels uploaded yet</h3>
                  <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
                    Share your knowledge, tutorials, or highlights by uploading your first short video!
                  </p>
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-cath-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cath-red-600 transition-colors flex items-center space-x-1 text-sm shadow border-none cursor-pointer outline-none"
                  >
                    <Plus size={16} />
                    <span>Upload First Reel</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-textColor mb-1">
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
                        className="rounded-full bg-blue-50 px-6 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 border-none cursor-pointer outline-none"
                      >
                        {isFetching ? "..." : t.seeMore || "See more"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* BOOKMARKS / PLAYLISTS SECTION */
            <div className="flex flex-col gap-4">
              {/* Playlists Filter Bar */}
              <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSelectedPlaylistId("")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border-none outline-none cursor-pointer ${
                    selectedPlaylistId === ""
                      ? "bg-cath-red-700 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Tất cả mục lưu
                </button>

                {playlists.map((playlist) => (
                  <button
                    key={playlist.playlistId}
                    onClick={() => setSelectedPlaylistId(playlist.playlistId)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border-none outline-none cursor-pointer ${
                      selectedPlaylistId === playlist.playlistId
                        ? "bg-cath-red-700 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {playlist.name}
                  </button>
                ))}

                {!showCreatePlaylist ? (
                  <button
                    onClick={() => setShowCreatePlaylist(true)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-gray-500 border border-dashed border-gray-300 hover:border-gray-500 hover:text-gray-700 transition-all cursor-pointer flex items-center gap-1 outline-none"
                  >
                    <Plus size={12} />
                    Danh sách mới
                  </button>
                ) : (
                  <form onSubmit={handleCreatePlaylistSubmit} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tên danh sách..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-xs outline-none focus:border-cath-red-700 bg-white h-7"
                    />
                    <button
                      type="submit"
                      className="bg-cath-red-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg hover:bg-cath-red-600 h-7 border-none cursor-pointer outline-none"
                    >
                      Tạo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreatePlaylist(false)}
                      className="bg-white text-gray-500 text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 h-7 cursor-pointer outline-none"
                    >
                      Hủy
                    </button>
                  </form>
                )}
              </div>

              {isBookmarksLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-48" />
                          <div className="h-3.5 bg-gray-200 rounded w-64" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookmarksError ? (
                <ErrorMessage message="Không thể tải video đã lưu." />
              ) : bookmarkedReels.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Film size={48} className="text-gray-300 mb-3" />
                  <h3 className="font-bold text-gray-700 mb-1">Chưa lưu video nào</h3>
                  <p className="text-sm text-gray-400 text-center max-w-sm">
                    Khám phá bảng tin Reels bên ngoài và lưu những video yêu thích của bạn về đây!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {bookmarkedReels.map((reel) => (
                    <WorkspaceReelListItem
                      key={reel.reelId}
                      reel={reel}
                      formatDate={formatDate}
                      formatNumber={formatNumber}
                      onPlay={handlePlay}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
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
