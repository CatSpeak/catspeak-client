import { useState } from "react"
import { Loader2, X, Youtube } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetMediaStatusQuery,
  useLazySearchMediaQuery,
} from "@/store/api/mediaApi"
import {
  classifyWatchInput,
  normalizeSearchQuery,
} from "@/features/video-call/utils/watchTogetherSearch"
import YouTubeSearchResultItem from "./YouTubeSearchResultItem"

const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 100

/**
 * WatchTogetherPanel — host drawer for the shared YouTube video.
 *
 * One unified input: a pasted YouTube link plays immediately (replacing the
 * current video without a confirm), while keywords run on Enter/Search — never
 * per keystroke. Results page through `nextPageToken`; selecting one starts it
 * right away and closes the panel only on success. Non-host participants see
 * the current status only.
 */
const WatchTogetherPanel = ({
  open,
  onClose,
  sessionId,
  isHost,
  isStarting,
  isStopping,
  onStart,
  onStop,
}) => {
  const { t } = useLanguage()
  const watchTogether = t?.rooms?.videoCall?.watchTogether

  const [input, setInput] = useState("")
  const [inputError, setInputError] = useState("")
  const [searchError, setSearchError] = useState("")
  const [results, setResults] = useState([])
  const [nextPageToken, setNextPageToken] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [startingVideoId, setStartingVideoId] = useState(null)

  const [triggerSearch] = useLazySearchMediaQuery()

  const { data: status } = useGetMediaStatusQuery(
    sessionId,
    { skip: !sessionId || !open },
  )

  const isPlaying = status?.status === "active"

  const resolveSearchError = (error) => {
    const code = error?.data?.errorCode || error?.data?.code
    if (code === "YT_SEARCH_NOT_CONFIGURED") {
      return (
        watchTogether?.searchNotConfigured ||
        "Tìm kiếm YouTube chưa được cấu hình. Bạn vẫn có thể dán link YouTube trực tiếp để phát."
      )
    }
    if (code === "YT_SEARCH_QUOTA_EXCEEDED") {
      return (
        watchTogether?.searchQuotaExceeded ||
        "Đã hết hạn mức tìm kiếm YouTube hôm nay. Bạn vẫn có thể dán link YouTube trực tiếp để phát."
      )
    }
    return (
      watchTogether?.searchError ||
      "Không thể tìm kiếm video. Bạn vẫn có thể dán link YouTube trực tiếp để phát."
    )
  }

  const resetSearch = () => {
    setResults([])
    setNextPageToken(null)
    setHasSearched(false)
    setSearchError("")
  }

  const startPlayback = async (watchUrl, videoId = null) => {
    setInputError("")
    setSearchError("")
    if (videoId) setStartingVideoId(videoId)
    try {
      // Overwrite flow (Q1=A, Q4=A): starting while active replaces the
      // current video without a manual stop or confirm. Auto-close only on
      // success (Q2=A); failures keep the old video + panel open (Q5=A).
      const result = await onStart?.(watchUrl)
      if (result) {
        setInput("")
        resetSearch()
        onClose?.()
      }
      return result
    } catch {
      // error toast handled in the hook
      return null
    } finally {
      if (videoId) setStartingVideoId(null)
    }
  }

  const runSearch = async (append = false) => {
    const query = normalizeSearchQuery(input)
    if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
      setInputError(
        watchTogether?.searchQueryLength ||
          `Từ khóa cần từ ${MIN_QUERY_LENGTH} đến ${MAX_QUERY_LENGTH} ký tự.`,
      )
      return
    }

    setInputError("")
    setSearchError("")
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsSearching(true)
      setHasSearched(true)
    }

    try {
      const response = await triggerSearch({
        sessionId,
        q: query,
        pageToken: append ? nextPageToken : undefined,
      }).unwrap()

      setResults((previous) =>
        append ? [...previous, ...response.items] : response.items,
      )
      setNextPageToken(response.nextPageToken || null)
    } catch (error) {
      setSearchError(resolveSearchError(error))
      if (!append) {
        setResults([])
        setNextPageToken(null)
      }
    } finally {
      setIsSearching(false)
      setIsLoadingMore(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const kind = classifyWatchInput(input)

    if (kind === "empty") return
    if (kind === "invalid_url") {
      setInputError(
        watchTogether?.invalidUrl || "Vui lòng nhập một link YouTube hợp lệ.",
      )
      return
    }
    if (kind === "url") {
      await startPlayback(input.trim())
      return
    }

    await runSearch()
  }

  const handleStop = async () => {
    try {
      const result = await onStop?.()
      // Consistent with start: stop success also auto-closes (Q10=A).
      if (result) onClose?.()
    } catch {
      // error toast handled in the hook
    }
  }

  const inputKind = classifyWatchInput(input)
  const isBusy = isStarting || isSearching

  const submitLabel = (() => {
    if (inputKind === "url") {
      if (isStarting) return watchTogether?.starting || "Đang phát..."
      return isPlaying
        ? watchTogether?.switchButton || "Đổi sang video này"
        : watchTogether?.startButton || "Phát video cho cả phòng"
    }
    if (isSearching) return watchTogether?.searching || "Đang tìm..."
    return watchTogether?.searchButton || "Tìm video"
  })()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      {open && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white shadow-2xl flex flex-col border-l border-border dark:border-[#3F3F3F] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-[#3F3F3F] shrink-0">
            <div className="flex items-center gap-2">
              <Youtube size={20} className="text-red-600" />
              <span className="font-semibold text-base">
                {watchTogether?.title || "Xem video chung"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors text-gray-500 dark:text-[#AAAAAA]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isHost ? (
              <div className="space-y-4">
                {isPlaying && (
                  <div className="rounded-xl bg-gray-50 dark:bg-[#272727] p-3 border border-border dark:border-[#3F3F3F]">
                    <p className="text-xs font-medium text-gray-500 dark:text-[#AAAAAA]">
                      {watchTogether?.nowPlaying || "Đang phát"}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate mt-0.5">
                      {status?.title || status?.videoId || "Đang phát video"}
                    </p>
                    {status?.watchUrl && (
                      <p className="text-xs text-gray-500 dark:text-[#AAAAAA] mt-1 truncate">
                        {status?.watchUrl}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={isStopping}
                      onClick={handleStop}
                      className="mt-2.5 w-full h-10 rounded-xl bg-gray-900 dark:bg-neutral-800 text-white text-sm font-semibold hover:bg-black dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                    >
                      {isStopping
                        ? (watchTogether?.stopping || "Đang dừng...")
                        : (watchTogether?.stopButton || "Dừng video")}
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200">
                    {watchTogether?.searchLabel ||
                      "Tìm video hoặc dán link YouTube"}
                  </label>
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      if (inputError) setInputError("")
                    }}
                    placeholder={
                      watchTogether?.searchPlaceholder ||
                      "Từ khóa hoặc https://www.youtube.com/watch?v=..."
                    }
                    className="w-full h-11 px-3 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#222222] text-foreground dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm"
                    autoFocus={!isPlaying}
                  />
                  {inputError && (
                    <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                      {inputError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isBusy || inputKind === "empty"}
                    className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSearching && <Loader2 size={16} className="animate-spin" />}
                    {submitLabel}
                  </button>
                </form>

                {searchError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                  >
                    {searchError}
                  </div>
                )}

                {hasSearched && !searchError && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-[#AAAAAA]">
                      {watchTogether?.searchResults || "Kết quả tìm kiếm"}
                    </p>

                    {isSearching ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500 dark:text-[#AAAAAA]">
                        <Loader2 size={16} className="animate-spin" />
                        {watchTogether?.searching || "Đang tìm..."}
                      </div>
                    ) : results.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-[#AAAAAA]">
                        {watchTogether?.noResults ||
                          "Không tìm thấy video phù hợp. Thử từ khóa khác."}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {results.map((item) => (
                          <YouTubeSearchResultItem
                            key={item.videoId}
                            item={item}
                            isActive={item.videoId === status?.videoId}
                            isStarting={startingVideoId === item.videoId}
                            disabled={Boolean(startingVideoId) || isStarting}
                            onSelect={(selected) =>
                              startPlayback(selected.watchUrl, selected.videoId)
                            }
                            playingLabel={watchTogether?.nowPlaying || "Đang phát"}
                          />
                        ))}
                      </div>
                    )}

                    {nextPageToken && !isSearching && results.length > 0 && (
                      <button
                        type="button"
                        disabled={isLoadingMore}
                        onClick={() => runSearch(true)}
                        className="w-full h-10 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#222222] text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-[#272727] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoadingMore && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {isLoadingMore
                          ? (watchTogether?.loadingMore || "Đang tải...")
                          : (watchTogether?.loadMoreResults || "Tải thêm kết quả")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-[#AAAAAA] text-sm py-10">
                {isPlaying
                  ? (watchTogether?.hostWatching ||
                      "Chủ phòng đang phát video chung.")
                  : (watchTogether?.notPlaying ||
                      "Chưa có video nào được phát trong phòng.")}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default WatchTogetherPanel
