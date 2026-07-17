import React, { useMemo, useState, useRef, useEffect } from "react"
import { Calendar, ChevronDown, ChevronUp, ListPlus, Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPlaylistsQuery, useCreatePlaylistMutation, useUpdatePlaylistMutation, useDeletePlaylistMutation, useGetBookmarkedReelsQuery } from "@/store/api/reelsApi"

import PlaylistReelList from "./PlaylistReelList"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

const getLocale = (lang) => {
  if (lang === "zh") return "zh-CN"
  if (lang === "vi") return "vi-VN"
  return "en-US"
}

const PlaylistAvatar = ({ covers }) => {
  if (!covers || covers.length === 0) {
    return (
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
        <ListPlus size={20} className="text-red-600" />
      </div>
    )
  }

  if (covers.length === 1) {
    return (
      <div className="w-11 h-11 rounded-lg shrink-0 overflow-hidden border border-gray-100">
        <img src={covers[0]} className="w-full h-full object-cover" alt="" />
      </div>
    )
  }

  if (covers.length === 2) {
    return (
      <div className="w-11 h-11 rounded-lg shrink-0 overflow-hidden border border-gray-100 flex">
        <div className="w-1/2 h-full border-r border-white/50">
          <img src={covers[0]} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="w-1/2 h-full">
          <img src={covers[1]} className="w-full h-full object-cover" alt="" />
        </div>
      </div>
    )
  }

  if (covers.length === 3) {
    return (
      <div className="w-11 h-11 rounded-lg shrink-0 overflow-hidden border border-gray-100 flex">
        <div className="w-1/2 h-full border-r border-white/50">
          <img src={covers[0]} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="w-1/2 h-full flex flex-col">
          <div className="w-full h-1/2 border-b border-white/50">
            <img src={covers[1]} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="w-full h-1/2">
            <img src={covers[2]} className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-11 h-11 rounded-lg shrink-0 overflow-hidden border border-gray-100 flex flex-wrap">
      <div className="w-1/2 h-1/2 border-r border-b border-white/50">
        <img src={covers[0]} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="w-1/2 h-1/2 border-b border-white/50">
        <img src={covers[1]} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="w-1/2 h-1/2 border-r border-white/50">
        <img src={covers[2]} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="w-1/2 h-1/2">
        <img src={covers[3]} className="w-full h-full object-cover" alt="" />
      </div>
    </div>
  )
}

const PlaylistRow = ({ playlist, expandedPlaylistId, setExpandedPlaylistId, ws, lang, dateFormatter, formatNumber, navigate }) => {
  const isExpanded = expandedPlaylistId === playlist.playlistId
  // Fetch bookmarked reels to get accurate live count
  const { data: bookmarkedReels } = useGetBookmarkedReelsQuery(playlist.playlistId)
  const count = bookmarkedReels ? bookmarkedReels.length : (playlist.bookmarksCount || 0)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(playlist.name)
  const [updatePlaylist, { isLoading: isUpdating }] = useUpdatePlaylistMutation()
  const [deletePlaylist, { isLoading: isDeleting }] = useDeletePlaylistMutation()
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const label = count === 1
    ? (lang?.itemCountSingular || "1 video")
    : (lang?.itemCount || "{{count}} videos").replace("{{count}}", count)

  const covers = bookmarkedReels?.map(r => r.coverUrl).filter(Boolean) || []

  const handleUpdate = async (e) => {
    e.stopPropagation()
    if (!editName.trim() || editName.trim() === playlist.name) {
      setIsEditing(false)
      setEditName(playlist.name)
      return
    }
    try {
      await updatePlaylist({ playlistId: playlist.playlistId, name: editName.trim() }).unwrap()
      setIsEditing(false)
      toast.success(lang?.updated || "Cập nhật thành công")
    } catch (err) {
      toast.error(lang?.updateFailed || "Cập nhật thất bại")
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deletePlaylist(playlist.playlistId).unwrap()
      toast.success(lang?.deleted || "Đã xóa playlist")
    } catch (err) {
      toast.error(lang?.deleteFailed || "Xóa thất bại")
    } finally {
      setIsConfirmDeleteOpen(false)
    }
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    setIsEditing(false)
    setEditName(playlist.name)
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden mb-2 group/row">
      <div
        onClick={() => !isEditing && setExpandedPlaylistId(isExpanded ? null : playlist.playlistId)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
      >
        <PlaylistAvatar covers={covers} />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate(e)
                  if (e.key === "Escape") handleCancelEdit(e)
                }}
                className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cath-red-500/20 focus:border-cath-red-500 bg-white shadow-inner transition-all"
              />
              <button onClick={handleUpdate} disabled={isUpdating} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Lưu">
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
              </button>
              <button onClick={handleCancelEdit} disabled={isUpdating} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Hủy">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="font-semibold text-gray-800 text-sm truncate">{playlist.name}</div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-400 mt-0.5">
            <span>{label}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {ws?.createdOn || "Created on"} {dateFormatter.format(new Date(playlist.createdAt))}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Edit name">
              <Pencil size={16} />
            </button>
            <button onClick={handleDeleteClick} disabled={isDeleting} className="p-1.5 bg-gray-100 text-gray-600 hover:text-red-600 rounded-lg hover:bg-[#ffdede] transition-colors" title="Delete playlist">
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          </div>
        )}

        <div className="ml-1 text-gray-400">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <PlaylistReelList
            playlistId={playlist.playlistId}
            formatNumber={formatNumber}
            navigate={navigate}
          />
        </div>
      )}

      <ConfirmationModal
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={lang?.deletePlaylistTitle || "Xóa Playlist"}
        message={lang?.deleteConfirm || "Bạn có chắc chắn muốn xóa playlist này?"}
        confirmText={lang?.delete || "Xóa"}
        cancelText={lang?.cancel || "Hủy"}
      />
    </div>
  )
}

const WorkspacePlaylistsTab = ({ formatNumber, formatDate, navigate }) => {
  const { t } = useLanguage()
  const ws = t?.catSpeak?.reels?.workspace || {}
  const currentLang = localStorage.getItem("communityLanguage") || "en"
  const locale = getLocale(currentLang)

  const { data: playlists, isLoading } = useGetPlaylistsQuery()
  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation()
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (showCreateInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showCreateInput])

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }),
    [locale]
  )

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return
    try {
      await createPlaylist({ name: newPlaylistName }).unwrap()
      setNewPlaylistName("")
      setShowCreateInput(false)
      toast.success("Playlist created!")
    } catch {
      toast.error("Failed to create playlist.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {!playlists || playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <ListPlus size={48} className="text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700 mb-1">{ws?.noPlaylists || "No playlists yet"}</h3>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-sm">
            {ws?.noPlaylistsDesc || "Save reels to playlists to organize and revisit your favorite content!"}
          </p>
          <button
            onClick={() => setShowCreateInput(true)}
            className="bg-cath-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cath-red-600 transition-colors flex items-center space-x-1 text-sm shadow"
          >
            <Plus size={16} />
            <span>{ws?.createFirst || "Create First Playlist"}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {playlists.map((playlist) => (
            <PlaylistRow
              key={playlist.playlistId}
              playlist={playlist}
              expandedPlaylistId={expandedPlaylistId}
              setExpandedPlaylistId={setExpandedPlaylistId}
              ws={ws}
              lang={t?.catSpeak?.reels?.detail?.playlistModal}
              dateFormatter={dateFormatter}
              formatNumber={formatNumber}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Create playlist input */}
      <div className="mt-2">
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCreateInput ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder={t?.catSpeak?.reels?.detail?.playlistModal?.placeholder || "Enter playlist name..."}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-cath-red-500 focus:ring-0"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              onBlur={(e) => {
                if (!newPlaylistName.trim() && !e.relatedTarget?.closest('.create-playlist-btn')) {
                  setShowCreateInput(false)
                }
              }}
            />
            <button
              onClick={handleCreate}
              disabled={!newPlaylistName.trim() || isCreating}
              className="create-playlist-btn px-4 py-2.5 bg-cath-red-700 text-white rounded-xl text-sm font-semibold hover:bg-cath-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 h-[42px]"
            >
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        {!showCreateInput && playlists?.length > 0 && (
          <button
            onClick={() => setShowCreateInput(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors mt-2"
          >
            <Plus size={18} />
            {t?.catSpeak?.reels?.detail?.playlistModal?.createNew || "Create new playlist"}
          </button>
        )}
      </div>
    </>
  )
}

export default WorkspacePlaylistsTab
