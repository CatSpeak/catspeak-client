import React, { useEffect, useState } from "react"
import { Loader2, Volume2, VolumeX } from "lucide-react"
import useSampleAudio from "../../hooks/useSampleAudio"

const resolveAudioPath = (audioPath, pinyin) => {
  if (!audioPath || !pinyin) return audioPath
  try {
    const [base, qs] = audioPath.split("?")
    if (base.includes("/sample-audio") && qs) {
      const params = new URLSearchParams(qs)
      if (!params.has("pinyin")) {
        params.set("pinyin", pinyin)
        return `${base}?${params.toString()}`
      }
    }
  } catch {
    // giữ nguyên audioPath nếu lỗi parse
  }
  return audioPath
}

/**
 * Nút nghe giọng mẫu của một thẻ.
 *
 * E-FC-003: tải lỗi thì nút chuyển sang trạng thái cảnh báo và hiện gợi ý "Nghe không được? Xem pinyin".
 * Không chặn phiên ôn: học viên vẫn chấm tiếp được.
 *
 * Truyền `audio` (kết quả useSampleAudio) khi component cha cần tự phát, ví dụ bài
 * điền từ phát giọng mẫu ngay lúc chấm đúng. Không truyền thì nút tự quản lý.
 */
const AudioButton = ({ audioPath, pinyin, audio, size = "md", label = "Nghe phát âm" }) => {
  const resolvedPath = resolveAudioPath(audioPath, pinyin)
  const own = useSampleAudio(resolvedPath)
  const { status, play } = audio || own
  const [showPinyin, setShowPinyin] = useState(false)

  useEffect(() => {
    setShowPinyin(false)
  }, [resolvedPath])

  const isError = status === "error"
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10"
  const icon = size === "lg" ? "w-7 h-7" : "w-5 h-5"

  return (
    <div className="inline-flex flex-col items-center gap-1.5" role={isError ? "status" : undefined}>
      <button
        type="button"
        onClick={play}
        aria-label={isError ? "Không tải được âm thanh, thử lại" : label}
        title={isError ? "Không tải được âm thanh" : label}
        className={`${dim} rounded-full flex items-center justify-center border transition-colors ${
          isError
            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
            : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-[#990011] dark:text-red-400 hover:bg-rose-100 dark:hover:bg-rose-950/60"
        }`}
      >
        {status === "loading" ? (
          <Loader2 className={`${icon} animate-spin`} />
        ) : isError ? (
          <VolumeX className={icon} />
        ) : (
          <Volume2 className={`${icon} ${status === "playing" ? "animate-pulse" : ""}`} />
        )}
      </button>
      {isError && (
        pinyin ? (
          showPinyin ? (
            <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{pinyin}</span>
          ) : (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Nghe không được?{" "}
              <button
                type="button"
                onClick={() => setShowPinyin(true)}
                className="underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
              >
                Xem pinyin
              </button>
            </p>
          )
        ) : (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Không tải được âm thanh
          </span>
        )
      )}
    </div>
  )
}

export default AudioButton
