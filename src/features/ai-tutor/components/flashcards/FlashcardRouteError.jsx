import React from "react"
import { useNavigate, useParams, useRouteError } from "react-router-dom"
import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react"

const isChunkError = (error) =>
  /dynamically imported module|Loading chunk|Importing a module script failed|Failed to fetch/i.test(
    String(error?.message || error || ""),
  )

/**
 * Lỗi ở các màn Sổ tay từ vựng (CHK-098): mất mạng khi chuyển màn thì module của màn
 * không tải được. Báo rõ là đang offline và cho thử lại, không để trang trắng hay
 * hiện lỗi kỹ thuật.
 *
 * Không lazy: phải hiện được đúng lúc không tải thêm được gì.
 */
const FlashcardRouteError = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const { lang = "vi" } = useParams()
  const offline = (typeof navigator !== "undefined" && navigator.onLine === false) || isChunkError(error)

  return (
    <div role="alert" className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        {offline ? <CloudOff className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
      </div>
      <h2 className="text-xl font-bold text-slate-900">
        {offline ? "Bạn đang offline" : "Sổ tay từ vựng gặp sự cố"}
      </h2>
      <p className="text-sm text-slate-500">
        {offline
          ? "Không tải được màn này vì mất kết nối mạng. Kết quả ôn đã lưu trên máy vẫn an toàn và sẽ đồng bộ khi có mạng lại."
          : "Có lỗi khi hiển thị màn này. Bạn tải lại trang hoặc quay về Sổ tay từ vựng nhé."}
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#990011] px-6 text-sm font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
        <button
          type="button"
          onClick={() => navigate(`/${lang}/ai-tutor/vocabulary-notebook`)}
          className="h-10 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700"
        >
          Về Sổ tay từ vựng
        </button>
      </div>
    </div>
  )
}

export default FlashcardRouteError
