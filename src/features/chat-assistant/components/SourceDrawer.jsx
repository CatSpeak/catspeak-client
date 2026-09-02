import { useEffect, useState } from "react"
import { X, FileText, ExternalLink } from "lucide-react"
import { fetchSource } from "../api/ragClient"
import { BRAND } from "../lib/theme"

/**
 * Ngăn kéo hiển thị nguyên văn đoạn trích (US-003 AC-002).
 *
 * Chỉ mở khi chunk KHÔNG có source_url. Chunk có url thì thẻ trích dẫn mở thẳng
 * trang tài liệu, không qua ngăn kéo này.
 *
 * Nội dung ở đây chỉ đọc, không sửa được (US-003 AC-004).
 */
export default function SourceDrawer({ source, onClose }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!source) return
    // excerpt đã có sẵn trong payload câu trả lời nên ngăn kéo hiện được ngay; vẫn
    // gọi API để lấy bản mới nhất VÀ để chứng minh chunk_id thật sự tồn tại trong
    // chỉ mục — đó là chỉ số "trích dẫn hợp lệ" ở SC-rag-chatbot-04.
    //
    // Không đặt state ngay trong thân effect (react-hooks/set-state-in-effect):
    // chỉ đặt trong callback bất đồng bộ, kèm cờ chống phản hồi về muộn sau khi
    // người dùng đã bấm sang thẻ trích dẫn khác.
    let cancelled = false
    fetchSource(source.chunk_id)
      .then((d) => {
        if (cancelled) return
        setDetail(d)
        setError(null)
      })
      .catch((e) => {
        if (cancelled) return
        setDetail(null)
        setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [source])

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  if (!source) return null
  // Chỉ dùng `detail` khi nó đúng là của chunk đang mở. Bấm nhanh sang thẻ trích dẫn
  // khác thì phản hồi cũ còn nằm trong state một nhịp, và hiện nhầm đoạn trích là
  // lỗi tệ nhất mà màn hình này có thể mắc.
  const fresh = detail?.chunk_id === source.chunk_id ? detail : null
  const text = fresh?.text || source.excerpt || ""

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative max-h-[75%] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <FileText size={15} className="shrink-0" />
              <span className="truncate">{fresh?.title || source.title}</span>
            </p>
            {(fresh?.section_path || source.section_path) && (
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {fresh?.section_path || source.section_path}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng đoạn trích"
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600">
            Không tải được đoạn trích gốc. {error}
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
            {text || "Đang tải…"}
          </p>
        )}

        {fresh?.url && (
          <a
            href={fresh.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: BRAND.red }}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Mở tài liệu gốc <ExternalLink size={13} />
          </a>
        )}

        <p className="mt-4 border-t border-neutral-200 pt-2 text-[11px] text-neutral-400 dark:border-neutral-700">
          Mã đoạn: {source.chunk_id}
        </p>
      </div>
    </div>
  )
}
