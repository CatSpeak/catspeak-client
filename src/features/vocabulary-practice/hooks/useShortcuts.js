import { useEffect, useRef } from "react"

const isTypingTarget = (el) =>
  el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)

/**
 * Phím tắt cho Practice (FE-05 S2). `bindings` là map tên phím -> hàm.
 *   - Tên phím theo KeyboardEvent.key; tổ hợp Alt viết "Alt+h".
 *   - Đang gõ trong ô nhập thì chỉ nhận tổ hợp Alt (để không nuốt chữ học viên gõ).
 *   - Bỏ qua khi bộ gõ tiếng Trung đang soạn chữ (isComposing).
 */
const useShortcuts = (bindings, enabled = true) => {
  const ref = useRef(bindings)
  useEffect(() => {
    ref.current = bindings
  })

  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => {
      if (e.isComposing || e.keyCode === 229 || e.ctrlKey || e.metaKey) return
      const name = e.altKey ? `Alt+${(e.code || "").replace(/^Key/, "").toLowerCase()}` : e.key
      if (!e.altKey && isTypingTarget(e.target)) return
      if (!e.altKey && e.target?.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return
      const fn = ref.current[name]
      if (!fn) return
      e.preventDefault()
      fn(e)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled])
}

export default useShortcuts
