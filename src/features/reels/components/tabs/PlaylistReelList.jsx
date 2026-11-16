import React, { useCallback } from "react"
import { Eye, Film, Heart, Loader2, Play, Trash2 } from "lucide-react"
import { useGetBookmarkedReelsQuery, useBookmarkReelMutation } from "@/store/api/reelsApi"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const PlaylistReelList = ({ playlistId, formatNumber, navigate }) => {
  const { data: reels, isLoading } = useGetBookmarkedReelsQuery(playlistId)
  const [toggleBookmark] = useBookmarkReelMutation()
  const { t } = useLanguage()

  const handleRemove = useCallback(async (reelId, e) => {
    e.stopPropagation()
    const loadingToastId = toast.loading(t?.catSpeak?.reels?.workspace?.removingFromPlaylist || "Removing...")
    try {
      await toggleBookmark({ reelId, playlistId }).unwrap()
      toast.success(t?.catSpeak?.reels?.workspace?.removedFromPlaylist || "Removed from playlist", { id: loadingToastId })
    } catch (err) {
      toast.error(t?.catSpeak?.reels?.workspace?.removeFailed || "Failed to remove", { id: loadingToastId })
    }
  }, [playlistId, toggleBookmark, t])

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-400">
        {t?.catSpeak?.reels?.workspace?.noVideosInPlaylist || "No videos in this playlist."}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 pl-4 border-l-2 border-border dark:border-[#3F3F3F]">
      {reels.map((reel) => (
        <div
          key={reel.reelId}
          onClick={() => navigate(`${reel.reelId}?playlistId=${playlistId}`)}
          className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-[#272727] rounded-lg transition-colors text-left w-full group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#242424] shrink-0 relative">
            {reel.coverUrl ? (
              <>
                <img 
                  src={reel.coverUrl} 
                  alt="" 
                  className="w-full h-full object-cover absolute inset-0 z-10" 
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-100 dark:bg-[#242424]">
                  <Film size={16} className="text-gray-300 dark:text-neutral-500" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#242424]">
                <Film size={16} className="text-gray-300 dark:text-neutral-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {reel.title || "Untitled"}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(reel.viewCount)}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(reel.likesCount)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate(`${reel.reelId}?playlistId=${playlistId}`)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-[#242424] hover:bg-gray-200 dark:hover:bg-[#333] transition-colors cursor-pointer"
              title="Watch Reel"
            >
              <Play size={14} className="text-gray-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={(e) => handleRemove(reel.reelId, e)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-[#242424] hover:bg-[#ffdede] dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Remove from playlist"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlaylistReelList
