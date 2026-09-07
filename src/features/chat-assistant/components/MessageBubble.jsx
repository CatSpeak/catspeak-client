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
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { sendFeedback } from "../api/ragClient"
import { renderMarkdown, stripCitations } from "../lib/markdown"
import { BRAND, topicColor } from "../lib/theme"

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
function TypingDots({ label }) {
  return (
    <span className="flex items-center gap-1 py-1" aria-label={label}>
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

/** Mã gửi lên server, trùng với FEEDBACK_REASONS ở core/interfaces/rag.py. Nhãn thì
 *  tra trong bảng dịch theo đúng mã này — bản tiếng Việt phải trùng nguyên văn với
 *  FEEDBACK_REASON_LABELS bên read/rag/messages.py, vì báo cáo cho nhóm quản trị đọc
 *  ra một đằng mà người dùng thấy một nẻo thì không ai đối chiếu được. */
const REASON_CODES = ["wrong_info", "off_topic", "unclear", "incomplete", "other"]

const MAX_NOTE = 500

/**
 * Hỏi lý do sau khi bấm không hài lòng.
 *
 * Hiện SAU khi đánh giá đã được ghi, không phải trước. Bắt chọn lý do rồi mới tính
 * một lượt dislike thì phần lớn người dùng bỏ luôn, và mất cả con số thô lẫn lý do.
 */
function ReasonPicker({ onPick, onClose, busy, L }) {
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState("")
  const F = L.feedback || {}

  return (
    <div className="mt-1 w-full max-w-[92%] rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
          {F.askReason}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label={F.skip}
          className="-mr-1 -mt-1 rounded p-0.5 text-neutral-400 hover:text-neutral-600"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {REASON_CODES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setReason(reason === code ? null : code)}
            className="rounded-full border px-2 py-1 text-[11px] transition"
            style={
              reason === code
                ? { borderColor: BRAND.red, background: BRAND.redSoft, color: BRAND.red }
                : undefined
            }
          >
            {F.reasons?.[code]}
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
            placeholder={F.notePlaceholder}
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
              {F.submit}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function MessageBubble({ message, onOpenSource, onContactSupport, onUpgrade }) {
  const { t } = useLanguage()
  const L = t.chatAssistant || {}
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
            <AlertTriangle size={13} /> {L.fallbackNotice}
          </span>
        )}
        {message.streaming && !message.text ? (
          <TypingDots label={L.typing} />
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

      {/* Nguồn hiện như LIÊN KẾT, không còn là thẻ viền tròn có chữ "Xem thêm:"
          (phản hồi 03/09). Bỏ chữ dẫn vì nó chiếm mất một phần ba bề ngang mà không
          nói thêm gì: cái gạch chân với con trỏ tay đã đủ báo là bấm được.

          Màu tra theo `topic` của tài liệu — xem lib/theme.js. Hai biến CSS chứ
          không phải hai lớp Tailwind: màu sinh ra lúc chạy, mà Tailwind chỉ sinh
          lớp cho những chuỗi nó QUÉT THẤY trong mã nguồn, nên `text-[#b45309]`
          ghép động sẽ không có thật trong tệp css. */}
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-1">
          {sources.map((s) => {
            const c = topicColor(s.topic)
            return (
              <button
                key={s.chunk_id}
                type="button"
                onClick={() => onOpenSource(s)}
                title={s.section_path || s.title}
                style={{ "--c": c.light, "--cd": c.dark }}
                className="inline-flex max-w-[240px] items-center gap-1 text-[11px] text-[color:var(--c)] underline decoration-1 underline-offset-2 transition hover:brightness-110 dark:text-[color:var(--cd)]"
              >
                {s.url ? (
                  <ExternalLink size={11} className="shrink-0" />
                ) : (
                  <FileText size={11} className="shrink-0" />
                )}
                <span className="truncate">{s.title}</span>
              </button>
            )
          })}
        </div>
      )}

      {message.contactSupport && (
        <button
          type="button"
          onClick={() => onContactSupport(message.forQuestion)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          style={{ background: BRAND.red }}
        >
          <LifeBuoy size={13} /> {L.contactSupport}
        </button>
      )}

      {message.upgrade && (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.orange})` }}
        >
          <Sparkles size={13} /> {L.upgrade}
        </button>
      )}

      {message.queryLogId && !isProblem && !message.streaming && (
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            aria-label={L.feedback?.up}
            aria-pressed={vote === 1}
            onClick={() => react(1)}
            className={`rounded p-1 transition ${vote === 1 ? "text-green-600" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            type="button"
            aria-label={L.feedback?.down}
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
            <span className="pl-1 text-[11px] text-neutral-400">{L.feedback?.thanks}</span>
          )}
        </div>
      )}

      {asking && (
        <ReasonPicker
          busy={busy}
          L={L}
          onPick={submitReason}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  )
}
