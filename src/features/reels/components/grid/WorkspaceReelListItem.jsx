import React, { memo, useCallback } from "react"
import { Calendar, Eye, Heart, Play, Trash2, Film } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"

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

  const handlePlayClick = useCallback(
    (event) => {
      event.stopPropagation()
      onPlay(reel)
    },
    [onPlay, reel],
  )

  const handleDeleteClick = useCallback(
    (event) => {
      event.stopPropagation()
      onDeleteClick(reel)
    },
    [onDeleteClick, reel],
  )

  return (
    <div
      onClick={handleOpen}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-white dark:bg-[#1A1A1A] px-4 py-3 sm:flex-row items-start sm:justify-between hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-sm cursor-pointer transition-all duration-200"
    >
      <div className="flex gap-4 min-w-0">
        {reel.coverUrl ? (
          <img
            src={reel.coverUrl}
            alt={reel.title}
            loading="lazy"
            className="w-16 aspect-[9/16] object-cover flex-shrink-0 bg-gray-100 border border-border group-hover:scale-[1.02] transition-transform duration-200"
          />
        ) : (
          <div className="w-16 aspect-[9/16] flex items-center justify-center bg-gray-50 dark:bg-[#242424] border border-border flex-shrink-0 text-gray-400">
            <Film />
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-gray-800 dark:text-white truncate text-base">
            {reel.title}
          </span>

          {reel.description && (
            <p className="text-sm text-textColor dark:text-neutral-300 truncate max-w-[280px] sm:max-w-md md:max-w-lg">
              {reel.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-sm text-lighttextGray dark:text-neutral-400 mt-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={18} />
              {formatDate(reel.createdAt)}
            </span>

            <span className="flex items-center gap-1">
              <Eye size={18} />
              {formatNumber(reel.viewCount || 0)}
            </span>

            <span className="flex items-center gap-1">
              <Heart size={18} />
              {formatNumber(reel.likesCount || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
        <IconButton
          onClick={handlePlayClick}
          title="Watch Reel"
          aria-label="Watch reel"
          variant="filled"
        >
          <Play />
        </IconButton>

        <IconButton
          onClick={handleDeleteClick}
          title="Delete Reel"
          aria-label="Delete reel"
          variant="filled"
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
  )
})

export default WorkspaceReelListItem
