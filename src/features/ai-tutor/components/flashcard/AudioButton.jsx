import React, { useState } from "react"
import { AlertTriangle, Loader2, Volume2 } from "lucide-react"
import useSampleAudio from "../../hooks/useSampleAudio"

/**
 * Nút nghe giọng mẫu của một thẻ.
 *
 * E-FC-003: tải lỗi thì nút chuyển sang trạng thái cảnh báo và hiện "Xem pinyin".
 * Không chặn phiên ôn: học viên vẫn chấm tiếp được.
 *
 * Truyền `audio` (kết quả useSampleAudio) khi component cha cần tự phát, ví dụ bài
 * điền từ phát giọng mẫu ngay lúc chấm đúng. Không truyền thì nút tự quản lý.
 */
const AudioButton = ({ audioPath, pinyin, audio, size = "md", label = "Nghe phát âm" }) => {
  const own = useSampleAudio(audioPath)
  const { status, play } = audio || own
  const [showPinyin, setShowPinyin] = useState(false)

  const isError = status === "error"
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10"
  const icon = size === "lg" ? "w-7 h-7" : "w-5 h-5"

  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={play}
        aria-label={isError ? "Không tải được âm thanh, thử lại" : label}
        title={isError ? "Không tải được âm thanh" : label}
        className={`${dim} rounded-full flex items-center justify-center border transition-colors ${
          isError
            ? "bg-amber-50 border-amber-300 text-amber-600"
            : "bg-rose-50 border-rose-200 text-[#990011] hover:bg-rose-100"
        }`}
      >
        {status === "loading" ? (
          <Loader2 className={`${icon} animate-spin`} />
        ) : isError ? (
          <AlertTriangle className={icon} />
        ) : (
          <Volume2 className={`${icon} ${status === "playing" ? "animate-pulse" : ""}`} />
        )}
      </button>
      {isError && pinyin && (
        showPinyin ? (
          <span className="text-sm font-medium text-slate-700">{pinyin}</span>
        ) : (
          <button
            type="button"
            onClick={() => setShowPinyin(true)}
            className="text-xs font-medium text-amber-700 underline underline-offset-2"
          >
            Xem pinyin
          </button>
        )
      )}
    </div>
  )
}

export default AudioButton
