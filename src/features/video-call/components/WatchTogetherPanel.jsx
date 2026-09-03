import { useState } from "react"
import { X, Youtube } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetMediaStatusQuery } from "@/store/api/mediaApi"
import { parseYouTubeUrl } from "@/shared/utils/linkUtils"

/**
 * WatchTogetherPanel — host drawer to paste a YouTube URL and start/stop the
 * shared watch-together video. Non-host participants see the current status.
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
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  const { data: status } = useGetMediaStatusQuery(
    sessionId,
    { skip: !sessionId || !open },
  )

  const handleStart = async (e) => {
    e.preventDefault()
    const parsed = parseYouTubeUrl(url)
    if (!parsed.isYouTube || !parsed.videoId) {
      setUrlError(
        t?.rooms?.videoCall?.watchTogether?.invalidUrl ||
          "Vui lòng nhập một link YouTube hợp lệ.",
      )
      return
    }
    setUrlError("")
    try {
      await onStart?.(url)
    } catch {
      // error toast handled in the hook
    }
  }

  const isPlaying = status?.status === "active"

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
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[380px] bg-white shadow-2xl flex flex-col border-l border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Youtube size={20} className="text-red-600" />
              <span className="font-semibold text-base">
                {t?.rooms?.videoCall?.watchTogether?.title || "Xem video chung"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isHost ? (
              <>
                {isPlaying ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gray-50 p-3 border border-border">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {status?.title || status?.videoId || "Đang phát video"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {status?.watchUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isStopping}
                      onClick={onStop}
                      className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isStopping
                        ? (t?.rooms?.videoCall?.watchTogether?.stopping ||
                            "Đang dừng...")
                        : (t?.rooms?.videoCall?.watchTogether?.stopButton ||
                            "Dừng video")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleStart} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {t?.rooms?.videoCall?.watchTogether?.inputLabel ||
                        "Dán link YouTube"}
                    </label>
                    <input
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        if (urlError) setUrlError("")
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full h-11 px-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm"
                      autoFocus
                    />
                    {urlError && (
                      <p className="text-xs text-red-600">{urlError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isStarting}
                      className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isStarting
                        ? (t?.rooms?.videoCall?.watchTogether?.starting ||
                            "Đang phát...")
                        : (t?.rooms?.videoCall?.watchTogether?.startButton ||
                            "Phát video cho cả phòng")}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 text-sm py-10">
                {isPlaying
                  ? (t?.rooms?.videoCall?.watchTogether?.hostWatching ||
                      "Chủ phòng đang phát video chung.")
                  : (t?.rooms?.videoCall?.watchTogether?.notPlaying ||
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
