import React, { memo, useCallback } from "react"
import { Calendar, Eye, Heart, Play, Trash2, Film } from "lucide-react"

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
      className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-200"
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
            <p className="text-xs text-textColor truncate max-w-[280px] sm:max-w-md md:max-w-lg mt-0.5">
              {reel.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-lighttextGray mt-1.5 flex-wrap">
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition-colors"
          title="Watch Reel"
          aria-label="Watch reel"
        >
          <Play size={18} className="text-gray-700" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-[#ffdede] hover:text-red-600 text-gray-700 transition-colors"
          title="Delete Reel"
          aria-label="Delete reel"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
})

export default WorkspaceReelListItem
