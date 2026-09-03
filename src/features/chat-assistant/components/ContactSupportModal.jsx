import { useState } from "react"
import { useSelector } from "react-redux"
import { Send } from "lucide-react"

import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput.jsx"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useSubmitContactMutation } from "@/store/api/contactApi"
import { BRAND } from "../lib/theme"

const MAX_MESSAGE = 1000

/**
 * Form liên hệ hỗ trợ, mở ngay trong widget khi chatbot không trả lời được.
 *
 * Dùng LẠI đúng đường gửi của form ở chân trang
 * (shared/components/Footer/ContactSection.jsx → POST /contact), không dựng endpoint
 * mới: hai form gửi vào hai chỗ khác nhau thì đội hỗ trợ phải mở hai hộp thư, và
 * sớm muộn một trong hai bị quên.
 *
 * Trước đây chỗ này điều hướng sang /connect. Đổi thành popup vì rời khỏi trang là
 * mất luôn đoạn hội thoại, mà câu người dùng vừa hỏi chính là thứ cần gửi kèm.
 */
export default function ContactSupportModal({ open, question, onClose }) {
  const { language } = useLanguage()
  const user = useSelector((s) => s.auth?.user)

  // Điền sẵn từ hồ sơ. Vẫn cho sửa: người dùng có thể muốn nhận trả lời ở hộp thư khác.
  const [email, setEmail] = useState(user?.email || "")
  const [name, setName] = useState(user?.fullName || user?.nickname || user?.username || "")
  const [message, setMessage] = useState(
    question ? `Mình hỏi trợ lý câu này nhưng chưa có câu trả lời:\n\n"${question}"\n\n` : "",
  )
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [submitContact, { isLoading }] = useSubmitContactMutation()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !message.trim()) {
      setError("Cần có email và nội dung câu hỏi.")
      return
    }
    try {
      await submitContact({
        email: email.trim(),
        name: name.trim(),
        message: message.trim().slice(0, MAX_MESSAGE),
        language,
      }).unwrap()
      setDone(true)
    } catch {
      setError("Chưa gửi được. Bạn thử lại sau ít phút giúp mình.")
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title="Liên hệ hỗ trợ">
      {done ? (
        <div className="py-2">
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            Đã gửi. Bộ phận hỗ trợ sẽ trả lời qua email <strong>{email}</strong>.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2 text-sm text-white"
              style={{ background: BRAND.red }}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">
            Trợ lý chưa tìm được câu trả lời cho câu hỏi này. Để lại email, đội hỗ trợ
            sẽ liên hệ lại.
          </p>

          <TextInput
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
          />
          <TextInput
            label="Họ tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên của bạn"
          />
          <div>
            <label
              htmlFor="chat-support-message"
              className="mb-1 block text-sm text-neutral-700 dark:text-neutral-200"
            >
              Nội dung
            </label>
            <textarea
              id="chat-support-message"
              rows={5}
              value={message}
              maxLength={MAX_MESSAGE}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="mt-1 text-right text-[11px] text-neutral-400">
              {message.length}/{MAX_MESSAGE}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white transition disabled:opacity-50"
              style={{ background: BRAND.red }}
            >
              <Send size={14} />
              {isLoading ? "Đang gửi…" : "Gửi"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
