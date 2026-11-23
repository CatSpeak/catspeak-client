import { Loader2, Youtube } from "lucide-react"

/**
 * One YouTube search result in the host drawer: 16:9 thumbnail with a duration
 * pill, two-line title, channel name, "now playing" badge and a local spinner
 * while this item is being started.
 */
const YouTubeSearchResultItem = ({
  item,
  isActive = false,
  isStarting = false,
  disabled = false,
  onSelect,
  playingLabel,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      disabled={disabled || isStarting}
      className="group flex w-full gap-3 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#222222] p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-[#1A1A1A]">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-[#AAAAAA]">
            <Youtube size={20} />
          </div>
        )}
        {item.duration && (
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
            {item.duration}
          </span>
        )}
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
          {item.title}
        </p>
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-[#AAAAAA]">
          {item.channelTitle}
        </p>
        {isActive && (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
            {playingLabel}
          </span>
        )}
      </div>
    </button>
  )
}

export default YouTubeSearchResultItem
