import { useState } from "react"
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  LifeBuoy,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react"
import { sendFeedback } from "../api/ragClient"
import { renderMarkdown, stripCitations } from "../lib/markdown"
import { BRAND } from "../lib/theme"

/**
 * Một bong bóng hội thoại.
 *
 * Bốn dạng bong bóng trong SRS mục 10, phân biệt bằng trường `status`:
 *   answered        có thẻ nguồn
 *   no_answer       không có thẻ, có nút Liên hệ hỗ trợ
 *   quota_exceeded  có nút Nâng cấp Premium
 *   blocked/unavailable/error  chỉ có chữ
 *
 * Câu trả lời dự phòng (fallback_used) hiển thị cảnh báo và KHÔNG có thẻ nguồn, vì
 * không có bước truy hồi nào diễn ra (US-006 AC-003).
 */

/**
 * Ba chấm nhấp nháy trong lúc chờ (FR-rag-chatbot-007).
 *
 * Chỉ hiện khi ĐÃ gửi mà CHƯA có mảnh chữ nào. Ngay khi token đầu tiên về thì đổi
 * sang chữ chảy dần — hai trạng thái khác nhau, và người dùng cần phân biệt được
 * "đang nghĩ" với "đang trả lời".
 */
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Đang soạn câu trả lời">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"
          style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
        />
      ))}
    </span>
  )
}

/** Nhãn phải trùng nguyên văn với FEEDBACK_REASON_LABELS bên read/rag/messages.py:
 *  báo cáo cho nhóm quản trị đọc ra một đằng mà người dùng thấy một nẻo thì không
 *  ai đối chiếu được. Mã thì trùng với FEEDBACK_REASONS ở core/interfaces/rag.py. */
const REASONS = [
  { code: "wrong_info", label: "Thông tin sai" },
  { code: "off_topic", label: "Không trả lời đúng câu hỏi" },
  { code: "unclear", label: "Khó hiểu" },
  { code: "incomplete", label: "Thiếu thông tin" },
  { code: "other", label: "Lý do khác" },
]

const MAX_NOTE = 500

/**
 * Hỏi lý do sau khi bấm không hài lòng.
 *
 * Hiện SAU khi đánh giá đã được ghi, không phải trước. Bắt chọn lý do rồi mới tính
 * một lượt dislike thì phần lớn người dùng bỏ luôn, và mất cả con số thô lẫn lý do.
 */
function ReasonPicker({ onPick, onClose, busy }) {
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState("")

  return (
    <div className="mt-1 w-full max-w-[92%] rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
          Chưa ổn ở chỗ nào? (không bắt buộc)
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Bỏ qua"
          className="-mr-1 -mt-1 rounded p-0.5 text-neutral-400 hover:text-neutral-600"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {REASONS.map((r) => (
          <button
            key={r.code}
            type="button"
            onClick={() => setReason(reason === r.code ? null : r.code)}
            className="rounded-full border px-2 py-1 text-[11px] transition"
            style={
              reason === r.code
                ? { borderColor: BRAND.red, background: BRAND.redSoft, color: BRAND.red }
                : undefined
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {reason && (
        <>
          <textarea
            rows={2}
            value={note}
            maxLength={MAX_NOTE}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Kể rõ hơn giúp mình (không bắt buộc)"
            className="mt-2 w-full resize-none rounded-lg border border-neutral-300 px-2 py-1.5 text-xs outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-neutral-800"
          />
          <div className="mt-1.5 flex items-center justify-end gap-2">
            <span className="text-[10px] text-neutral-400">
              {note.length}/{MAX_NOTE}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => onPick(reason, note.trim() || null)}
              className="rounded-lg px-3 py-1 text-[11px] font-medium text-white transition disabled:opacity-50"
              style={{ background: BRAND.red }}
            >
              Gửi
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function MessageBubble({ message, onOpenSource, onContactSupport, onUpgrade }) {
  const [vote, setVote] = useState(0)
  const [asking, setAsking] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white"
          style={{ background: BRAND.red }}
        >
          {message.text}
        </div>
      </div>
    )
  }

  const sources = message.sources || []
  const isProblem = ["blocked", "unavailable", "error", "quota_exceeded"].includes(
    message.status,
  )

  const react = async (value) => {
    const next = vote === value ? 0 : value
    setVote(next)
    setAsking(next === -1)
    setSent(false)
    if (!message.queryLogId) return
    try {
      await sendFeedback(message.queryLogId, next)
    } catch {
      // Phản hồi là dữ liệu phụ trợ, hỏng thì không báo lỗi cho người dùng.
    }
  }

  const submitReason = async (reason, note) => {
    setBusy(true)
    try {
      // Gửi lại value = -1 cùng lý do: một lệnh UPDATE ghi đè cả ba cột, không phải
      // hai lượt dislike. Bảng khoá theo id dòng nhật ký nên không thể đếm hai lần.
      await sendFeedback(message.queryLogId, -1, { reason, note })
      setSent(true)
    } catch {
      // Ô ghi chú có thể bị kiểm duyệt chặn và trả 422. Vẫn coi như xong: lượt
      // dislike đã ghi ở bước trước rồi, phần lý do chỉ là thêm.
      setSent(true)
    } finally {
      setBusy(false)
      setAsking(false)
    }
  }

  // Mã [S1] bị gỡ ngay trước lúc vẽ, không gỡ ở server: nguyên văn có mã vẫn nằm
  // trong nhật ký để tra khi có khiếu nại. Xem lib/markdown.js.
  const html = renderMarkdown(stripCitations(message.text))

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div
        className={`max-w-[92%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm leading-relaxed ${
          isProblem
            ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {message.fallbackUsed && (
          <span className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle size={13} /> Câu trả lời tham khảo
          </span>
        )}
        {message.streaming && !message.text ? (
          <TypingDots />
        ) : (
          <>
            {/* Chuỗi đã qua DOMPurify trong renderMarkdown. Đừng bao giờ đưa thẳng
                message.text vào đây. */}
            <div
              /* Kiểu chữ đặt ở đây chứ không trong markdown.js: bộ dựng trả HTML
                 trần, còn khoảng cách và độ đậm là việc của khung chứa nó.
                 space-y-1.5 lo khoảng cách giữa các đoạn, nên thẻ p tự nó không
                 cần margin — có margin thì cộng dồn thành thưa lỗ chỗ. */
              className="space-y-1.5 [&_a]:break-words [&_a]:underline [&_code]:text-[0.85em] [&_li]:leading-snug [&_ol]:my-1 [&_ol]:space-y-1 [&_p]:m-0 [&_strong]:font-semibold [&_ul]:my-1 [&_ul]:space-y-1"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {message.streaming && (
              <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-current align-middle" />
            )}
          </>
        )}
      </div>

      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.map((s) => (
            <button
              key={s.chunk_id}
              type="button"
              onClick={() => onOpenSource(s)}
              title={s.section_path || s.title}
              className="inline-flex max-w-[240px] items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {s.url ? <ExternalLink size={11} /> : <FileText size={11} />}
              <span className="shrink-0 text-neutral-400">Xem thêm:</span>
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      {message.contactSupport && (
        <button
          type="button"
          onClick={() => onContactSupport(message.forQuestion)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          style={{ background: BRAND.red }}
        >
          <LifeBuoy size={13} /> Liên hệ hỗ trợ
        </button>
      )}

      {message.upgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.orange})` }}
        >
          <Sparkles size={13} /> Nâng cấp Premium
        </button>
      )}

      {message.queryLogId && !isProblem && !message.streaming && (
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            aria-label="Câu trả lời hữu ích"
            aria-pressed={vote === 1}
            onClick={() => react(1)}
            className={`rounded p-1 transition ${vote === 1 ? "text-green-600" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            type="button"
            aria-label="Câu trả lời chưa hữu ích"
            aria-pressed={vote === -1}
            onClick={() => react(-1)}
            className="rounded p-1 transition"
            style={{ color: vote === -1 ? BRAND.red : undefined }}
          >
            <ThumbsDown
              size={13}
              className={vote === -1 ? "" : "text-neutral-400 hover:text-neutral-600"}
            />
          </button>
          {sent && (
            <span className="pl-1 text-[11px] text-neutral-400">Cảm ơn phản hồi</span>
          )}
        </div>
      )}

      {asking && (
        <ReasonPicker
          busy={busy}
          onPick={submitReason}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  )
}
