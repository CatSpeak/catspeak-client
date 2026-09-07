import { useCallback, useEffect, useState } from "react"

/**
 * Lịch sử hội thoại của widget chatbot (FR-rag-chatbot-008).
 *
 * Giữ 50 lượt gần nhất trong localStorage, lượt cũ hơn tự bị loại. Phase 1 không có
 * nút xoá lịch sử — quyết định của BA ngày 25/08 (OQ-03).
 *
 * Lưu ở localStorage nghĩa là KHÔNG đồng bộ giữa các thiết bị. Đây là giả định đã
 * ghi trong SRS mục 11; muốn cross-device thì phải thiết kế lại phần này.
 *
 * Khoá tách theo accountId để hai người dùng chung một máy không thấy hội thoại của
 * nhau.
 */
const MAX_TURNS = 50
const KEY_PREFIX = "catspeak.chatAssistant.history"

function keyFor(accountId) {
  return accountId ? `${KEY_PREFIX}.${accountId}` : KEY_PREFIX
}

function read(accountId) {
  try {
    const raw = localStorage.getItem(keyFor(accountId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(-MAX_TURNS) : []
  } catch {
    return []
  }
}

export default function useChatHistory(accountId) {
  const [messages, setMessages] = useState(() => read(accountId))

  useEffect(() => {
    setMessages(read(accountId))
  }, [accountId])

  useEffect(() => {
    try {
      localStorage.setItem(
        keyFor(accountId),
        JSON.stringify(messages.slice(-MAX_TURNS)),
      )
    } catch {
      // Hết dung lượng hoặc trình duyệt chặn: bỏ qua. Mất lịch sử khó chịu nhưng
      // không được làm hỏng widget.
    }
  }, [messages, accountId])

  const append = useCallback((msg) => {
    setMessages((prev) => [...prev, msg].slice(-MAX_TURNS))
  }, [])

  /** Cập nhật tin nhắn cuối — dùng khi đang stream từng mảnh vào đúng một bubble. */
  const patchLast = useCallback((patch) => {
    setMessages((prev) => {
      if (!prev.length) return prev
      const next = prev.slice()
      next[next.length - 1] = { ...next[next.length - 1], ...patch }
      return next
    })
  }, [])

  /** Hai lượt gần nhất, đúng định dạng API mong đợi. */
  const apiHistory = useCallback(
    () =>
      messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-4)
        .map((m) => ({ role: m.role, content: (m.text || "").slice(0, 2000) })),
    [messages],
  )

  return { messages, append, patchLast, apiHistory, isEmpty: messages.length === 0 }
}
