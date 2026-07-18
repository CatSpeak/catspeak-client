import React, { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, Plus, Loader2, ListPlus } from "lucide-react"
import { useGetPlaylistsQuery, useCreatePlaylistMutation, useBookmarkReelMutation, useGetBookmarkedReelsQuery } from "@/store/api/reelsApi"
import toast from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"

const PlaylistCountItem = ({ playlist, lang }) => {
  const { data: bookmarkedReels } = useGetBookmarkedReelsQuery(playlist.playlistId)
  const count = bookmarkedReels ? bookmarkedReels.length : (playlist.bookmarksCount || 0)
  const label = count === 1
    ? (lang?.itemCountSingular || "1 video")
    : (lang?.itemCount || "{{count}} videos").replace("{{count}}", count)
  return <div className="text-xs text-gray-500 mt-0.5">{label}</div>
}

export default function ReelPlaylistModal({ reelId, onClose }) {
  const { t } = useLanguage()
  const lang = t?.catSpeak?.reels?.detail?.playlistModal || {}
  
  const { data: playlists, isLoading: isLoadingPlaylists } = useGetPlaylistsQuery()
  const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation()
  const [bookmarkReel] = useBookmarkReelMutation()
  
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [showCreateInput, setShowCreateInput] = useState(false)

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return
    try {
      await createPlaylist({ name: newPlaylistName }).unwrap()
      setNewPlaylistName("")
      setShowCreateInput(false)
      toast.success(lang.createSuccess || "Playlist created successfully.")
    } catch (error) {
      toast.error(lang.createFailed || "Failed to create playlist.")
    }
  }

  const handleSelectPlaylist = async (playlistId) => {
    try {
      await bookmarkReel({ reelId, playlistId }).unwrap()
      toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.addToPlaylistSuccess || "Added to playlist.")
      onClose()
    } catch (error) {
      toast.error(t?.catSpeak?.reels?.detail?.moreMenu?.actionFailed || "Failed to perform action.")
    }
  }

  return (
    <Modal open={true} onClose={onClose} showCloseButton={false} className="max-w-sm w-full p-0">
      <div className="flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {lang.title || "Save to Playlist"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingPlaylists ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : playlists?.length === 0 ? (
            <div className="text-center p-6 text-sm text-gray-500">
              {lang.empty || "You don't have any playlists yet."}
            </div>
          ) : (
            playlists?.map(playlist => (
              <button
                key={playlist.playlistId}
                onClick={() => handleSelectPlaylist(playlist.playlistId)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left mt-1"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <ListPlus size={20} className="text-gray-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-gray-900 text-sm truncate">{playlist.name}</div>
                  <PlaylistCountItem playlist={playlist} lang={lang} />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCreateInput ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder={lang.placeholder || "Enter playlist name..."}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-cath-red-500 focus:ring-0"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                autoFocus={showCreateInput}
              />
              <button 
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || isCreating}
                className="px-4 py-2.5 bg-cath-red-700 text-white rounded-xl text-sm font-semibold hover:bg-cath-red-600 transition-colors disabled:opacity-50 flex items-center gap-2 h-[42px]"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span className="hidden sm:inline">
                  {lang.create || "Create"}
                </span>
              </button>
            </div>
          </div>
          
          {!showCreateInput && (
            <button
              onClick={() => setShowCreateInput(true)}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
            >
              <Plus size={18} />
              {lang.createNew || "Create new playlist"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
