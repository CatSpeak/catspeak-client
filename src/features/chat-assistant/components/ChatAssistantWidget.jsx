import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { MessageCircle, X, Send } from "lucide-react"

import {
  askQuestionStream,
  callerFrom,
  fetchQuota,
  fetchSuggestions,
  storedToken,
} from "../api/ragClient"
import useChatHistory from "../hooks/useChatHistory"
import ContactSupportModal from "./ContactSupportModal"
import MessageBubble from "./MessageBubble"
import SourceDrawer from "./SourceDrawer"
import { BRAND } from "../lib/theme"

const MAX_CHARS = 500          // FR-rag-chatbot-013
const WARN_REMAINING = 3       // FR-rag-chatbot-018

/**
 * Chọn câu báo lỗi theo đúng thứ đã hỏng.
 *
 * Trước đây mọi lỗi đều ra "Chatbot đang gặp sự cố kỹ thuật". Ngày 02/09 mất gần
 * một buổi vì câu đó: thực tế là 401 do lệch `iss` giữa token và cấu hình, tức là
 * vấn đề cấu hình chứ không phải chatbot hỏng, mà câu thông báo dẫn người đọc đi
 * đúng hướng ngược lại.
 *
 * Người dùng thật không cần biết mã lỗi. Nhưng họ cần biết việc phải làm khác nhau:
 * hết phiên thì đăng nhập lại, mất mạng thì kiểm tra mạng, hỏng thật thì chờ.
 */
function errorMessage(e) {
  if (navigator.onLine === false) {
    return "Không có kết nối mạng. Vui lòng kiểm tra lại."
  }
  if (e?.status === 401 || e?.status === 403) {
    return "Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại rồi hỏi tiếp giúp mình."
  }
  if (e?.status === 429) {
    return "Đang có nhiều người hỏi cùng lúc. Bạn thử lại sau một lát nhé."
  }
  return "Chatbot đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
}

/**
 * Widget trợ lý chatbot (TASK-AI-08).
 *
 * Nút nổi góc dưới phải, hiện trên mọi màn hình sau khi đăng nhập
 * (FR-rag-chatbot-001). Mount một lần ở App.jsx, cạnh PiPWidget.
 *
 * Widget hỏng thì im lặng: nút không hiện, phần còn lại của ứng dụng chạy bình
 * thường (E-rag-chatbot-004).
 */
/**
 * Điều hướng bằng window.location chứ không bằng useNavigate.
 *
 * Widget mount ở App.jsx, cạnh PiPWidget — tức là NGOÀI <AppRouter />, nên không có
 * context của Router và useNavigate() ném lỗi ngay lúc render. Đưa widget vào trong
 * router thì phải nhét nó vào từng layout, mà nó cần hiện trên mọi màn hình.
 *
 * Chỉ còn nút Nâng cấp đi đường này, và đổi lại là tải lại trang. Chấp nhận được vì
 * đó là hành động rời khỏi cuộc hội thoại. Nút Liên hệ hỗ trợ trước đây cũng điều
 * hướng, nay mở popup ngay tại chỗ — rời trang là mất luôn đoạn hội thoại, mà câu
 * vừa hỏi chính là thứ cần gửi kèm.
 */
function goTo(path) {
  window.location.assign(path)
}


export default function ChatAssistantWidget() {
  // Redux truoc, localStorage sau — hai cho phai cung mot gia tri, nhung Redux co the
  // trong khi token duoc dat bang tay luc phat trien ma chua tai lai trang.
  const token = useSelector((s) => s.auth?.token) || storedToken()
  const user = useSelector((s) => s.auth?.user)

  const accountId = user?.accountId || user?.AccountId || user?.id || null
  const { messages, append, patchLast, apiHistory, isEmpty } =
    useChatHistory(accountId)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [quota, setQuota] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [drawerSource, setDrawerSource] = useState(null)
  const [inputLocked, setInputLocked] = useState(false)
  const [supportFor, setSupportFor] = useState(null)

  const listRef = useRef(null)
  const abortRef = useRef(null)
  // Gom các mảnh delta ở ref chứ không ở state: mỗi token là một lần setState, và
  // đọc lại state cũ trong callback sẽ dính giá trị của lần render trước.
  const bufferRef = useRef("")
  const caller = callerFrom(user)

  // Lần đầu mở mà chưa có lịch sử thì lấy gợi ý câu mẫu (FR-rag-chatbot-009).
  //
  // Có thử lại, và KHÔNG nuốt lỗi. ai-api mất khoảng 40 giây nạp mô hình nhúng 543MB
  // mỗi lần khởi động lại; mở widget trong khoảng đó thì request hỏng. Effect này chỉ
  // phụ thuộc [open, token, isEmpty] — không cái nào đổi sau đó — nên một lần hỏng là
  // mất gợi ý cho tới khi tải lại trang. Đúng lỗi gặp ngày 30/08.
  //
  // KHÔNG chép cứng danh sách gợi ý sang đây làm phương án dự phòng. Danh sách bên
  // read/rag/messages.py được chọn theo điểm đo trên chính chỉ mục đang chạy; bản chép
  // ở client sẽ lệch sau mỗi lần sửa knowledge/ rồi gợi ý một câu mà chatbot từ chối
  // trả lời. Mà server không gọi được thì ô chat cũng hỏng: để trống trung thực hơn.
  useEffect(() => {
    if (!open || !token) return
    fetchQuota(caller.tier).then(setQuota).catch(() => {})
    if (!isEmpty || suggestions.length > 0) return

    let cancelled = false
    // Mốc chờ cộng dồn 31 giây, phủ hết khoảng ai-api nạp mô hình.
    const DELAYS = [0, 3000, 8000, 20000]
    ;(async () => {
      for (const wait of DELAYS) {
        if (wait) await new Promise((r) => setTimeout(r, wait))
        if (cancelled) return
        try {
          const r = await fetchSuggestions()
          if (!cancelled) setSuggestions(r.items || [])
          return
        } catch (e) {
          if (cancelled) return
          // 401 thì thử lại vô ích: token không tự tốt lên sau ba giây. Dừng ngay
          // và nói rõ, thay vì lặp bốn lần rồi im lặng.
          if (e?.status === 401 || e?.status === 403) {
            console.warn(
              "[chat-assistant] ai-api từ chối token, không lấy được gợi ý:",
              e.body || e.message,
            )
            return
          }
          console.warn("[chat-assistant] chưa lấy được gợi ý, sẽ thử lại:", e.message)
        }
      }
    })()
    return () => {
      cancelled = true
    }
    // caller.tier đọc lại mỗi lần mở là đủ; không cần theo dõi từng thay đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token, isEmpty])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, open])

  useEffect(() => () => abortRef.current?.abort(), [])

  const tooLong = draft.length > MAX_CHARS
  const canSend = draft.trim().length > 0 && !tooLong && !busy && !inputLocked

  const applyFinal = useCallback(
    (payload, question) => {
      patchLast({
        // done.answer LÀ bản chính thức, không phải các mảnh delta ghép lại.
        text: payload.answer,
        status: payload.status,
        sources: payload.sources || [],
        queryLogId: payload.query_log_id,
        fallbackUsed: payload.fallback_used,
        contactSupport: payload.contact_support,
        upgrade: payload.upgrade,
        forQuestion: question,
        streaming: false,
      })
      if (payload.quota) setQuota(payload.quota)
      // Hết quota thì khoá ô nhập cho tới khi reset (US-005 AC-004).
      if (payload.status === "quota_exceeded") setInputLocked(true)
    },
    [patchLast],
  )

  const send = useCallback(
    async (text) => {
      const question = (text ?? draft).trim()
      if (!question || question.length > MAX_CHARS || busy) return

      const history = apiHistory()
      append({ role: "user", text: question, at: Date.now() })
      append({ role: "assistant", text: "", streaming: true, at: Date.now() })
      setDraft("")
      setBusy(true)
      setSuggestions([])

      const ctrl = new AbortController()
      abortRef.current = ctrl
      bufferRef.current = ""
      try {
        const done = await askQuestionStream({
          question,
          history,
          caller,
          signal: ctrl.signal,
          onMeta: (m) => m.quota && setQuota(m.quota),
          onDelta: (piece) => {
            bufferRef.current += piece
            patchLast({ text: bufferRef.current })
          },
        })
        applyFinal(done, question)
      } catch (e) {
        if (e.name !== "AbortError") {
          patchLast({ text: errorMessage(e), status: "error", streaming: false })
        }
      } finally {
        bufferRef.current = ""
        setBusy(false)
        abortRef.current = null
      }
    },
    [draft, busy, apiHistory, append, patchLast, applyFinal, caller],
  )

  // Chưa đăng nhập thì không hiện widget (FR-rag-chatbot-001). Quota đếm theo tài
  // khoản, nên người dùng ẩn danh không có gì để đếm.
  //
  // Trước đây có cờ VITE_AI_ALLOW_ANONYMOUS mở widget khi chưa đăng nhập, để thử
  // giao diện lúc chưa dựng được catspeak-api tại máy. Đã gỡ ngày 02/09: một đường
  // tắt còn nằm trong code là một đường tắt sớm muộn có người bật nhầm ở production.
  // Muốn thử tay không cần đăng nhập thật thì dùng tools/mint_dev_token.py bên
  // catspeak-ai — nó ký token bằng đúng JWT_SECRET, và chỉ chạy được trên máy có
  // khoá đó.
  if (!token) return null

  const remaining = quota?.remaining
  const showWarning =
    typeof remaining === "number" && remaining > 0 && remaining <= WARN_REMAINING

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở trợ lý CatSpeak"
          /* right-24 chứ không right-5: BugReportButton đã chiếm bottom-6 right-6.
             Để cả hai ở góc thì nút này đè lên nút báo lỗi và không ai bấm được nút
             dưới. Dời sang trái một khoảng bằng bề rộng nút cộng lề. */
          style={{ background: BRAND.red }}
          className="fixed bottom-5 right-24 z-[60] flex h-13 w-13 items-center justify-center rounded-full p-3.5 text-white shadow-lg transition hover:scale-105 hover:brightness-110"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-[60] flex h-[560px] max-h-[80vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Trợ lý CatSpeak
              </p>
              <p className="text-[11px] text-neutral-500">
                Trả lời dựa trên tài liệu chính thức
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng trợ lý"
              className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={18} />
            </button>
          </header>

          <div className="relative flex-1 overflow-hidden">
            <div ref={listRef} className="h-full space-y-3 overflow-y-auto px-4 py-3">
              {isEmpty && (
                <p className="pt-6 text-center text-sm text-neutral-500">
                  Hỏi mình bất cứ điều gì về CatSpeak.
                </p>
              )}
              {messages.map((m, i) => (
                <MessageBubble
                  key={`${m.at}-${i}`}
                  message={m}
                  onOpenSource={(s) =>
                    s.url ? window.open(s.url, "_blank", "noreferrer") : setDrawerSource(s)
                  }
                  onContactSupport={(q) => setSupportFor(q || "")}
                  onUpgrade={() => goTo("/pricing")}
                />
              ))}

              {suggestions.length > 0 && isEmpty && (
                <div className="flex flex-col gap-1.5 pt-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-left text-xs text-neutral-700 transition hover:border-[#990011] hover:bg-[rgba(153,0,17,0.06)] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <SourceDrawer source={drawerSource} onClose={() => setDrawerSource(null)} />
            <ContactSupportModal
              open={supportFor !== null}
              question={supportFor}
              onClose={() => setSupportFor(null)}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (canSend) send()
            }}
            className="border-t border-neutral-200 px-3 py-2.5 dark:border-neutral-700"
          >
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={draft}
                disabled={inputLocked}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (canSend) send()
                  }
                }}
                placeholder={
                  inputLocked ? "Đã hết lượt hỏi hôm nay" : "Nhập câu hỏi…"
                }
                className="max-h-28 flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#990011] disabled:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Gửi câu hỏi"
                style={{ background: BRAND.red }}
                className="rounded-xl p-2.5 text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>

            {tooLong && (
              <p className="mt-1 text-[11px] text-red-600">
                Câu hỏi tối đa {MAX_CHARS} ký tự.
              </p>
            )}
            {!tooLong && showWarning && (
              <p className="mt-1 text-[11px] text-amber-600">
                Còn {remaining} câu hỏi hôm nay
              </p>
            )}
          </form>
        </div>
      )}
    </>
  )
}
