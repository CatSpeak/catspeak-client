import React, { memo, useCallback } from "react"
import { Calendar, Eye, Heart, Play, Trash2, Film } from "lucide-react"
import { isReelHidden, reelStatusTone } from "../../utils/moderationStatus"

const TONE_CLASS = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  red: "bg-red-50 text-red-700 border-red-200",
}

const WorkspaceReelListItem = memo(function WorkspaceReelListItem({
  reel,
  formatDate,
  formatNumber,
  onDeleteClick,
  onPlay,
  statusLabels = {},
  statusHints = {},
}) {
  // Reel đang kiểm duyệt / chờ duyệt / bị từ chối chưa có video để phát.
  const hidden = isReelHidden(reel.status)
  const tone = reelStatusTone(reel.status)

  const handleOpen = useCallback(() => {
    if (!hidden) onPlay(reel)
  }, [hidden, onPlay, reel])

  const handlePlayClick = useCallback((event) => {
    event.stopPropagation()
    if (!hidden) onPlay(reel)
  }, [hidden, onPlay, reel])

  const handleDeleteClick = useCallback((event) => {
    event.stopPropagation()
    onDeleteClick(reel)
  }, [onDeleteClick, reel])

  return (
    <div
      onClick={handleOpen}
      className={`group flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${hidden ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {reel.coverUrl ? (
          <img
            src={reel.coverUrl}
            alt={reel.title}
            loading="lazy"
            className="w-16 h-16 rounded object-cover flex-shrink-0 bg-gray-100 border border-border group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="w-16 h-16 rounded flex items-center justify-center bg-gray-50 border border-border flex-shrink-0 text-gray-400">
            <Film size={24} />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-800 truncate text-sm sm:text-base">
              {reel.title}
            </span>
            {tone && (
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASS[tone]}`}>
                {statusLabels[reel.status] || reel.status}
              </span>
            )}
          </div>
          {reel.description && (
            <p className="text-xs text-textColor truncate max-w-[280px] sm:max-w-md md:max-w-lg mt-0.5">
              {reel.description}
            </p>
          )}
          {tone && statusHints[reel.status] && (
            <p className="text-xs text-gray-500 mt-0.5">{statusHints[reel.status]}</p>
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
          disabled={hidden}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
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
