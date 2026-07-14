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
    const loadingToastId = toast.loading(t?.catSpeak?.reels?.detail?.moreMenu?.savingReel || "Removing...")
    try {
      await toggleBookmark({ reelId, playlistId }).unwrap()
      toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.saveSuccess || "Removed from playlist", { id: loadingToastId })
    } catch (err) {
      toast.error(t?.catSpeak?.reels?.detail?.moreMenu?.saveFailed || "Failed to remove", { id: loadingToastId })
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
        No videos in this playlist.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 pl-4 border-l-2 border-gray-100">
      {reels.map((reel) => (
        <div
          key={reel.reelId}
          onClick={() => navigate(`${reel.reelId}?playlistId=${playlistId}`)}
          className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left w-full group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
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
                <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-gray-100">
                  <Film size={16} className="text-gray-300" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Film size={16} className="text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {reel.title || "Untitled"}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
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
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Watch Reel"
            >
              <Play size={14} className="text-gray-700" />
            </button>
            <button
              onClick={(e) => handleRemove(reel.reelId, e)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-[#ffdede] hover:text-red-600 text-gray-700 transition-colors"
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
