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
 *
 * Bên gọi PHẢI truyền `key` đổi theo câu hỏi. Component này nằm luôn trong cây
 * (chỉ trả null khi đóng), nên hàm khởi tạo useState chỉ chạy đúng một lần — lần
 * đó `question` còn là null. Không có key thì ô nội dung luôn trống trơn, đúng lỗi
 * phát hiện ngày 03/09.
 */
export default function ContactSupportModal({ open, question, onClose }) {
  const { t, language } = useLanguage()
  const S = t.chatAssistant?.support || {}
  const user = useSelector((s) => s.auth?.user)

  // Điền sẵn từ hồ sơ. Vẫn cho sửa: người dùng có thể muốn nhận trả lời ở hộp thư khác.
  const [email, setEmail] = useState(user?.email || "")
  const [name, setName] = useState(user?.fullName || user?.nickname || user?.username || "")
  const [message, setMessage] = useState(
    question ? `${S.prefill || ""}\n\n"${question}"\n\n` : "",
  )
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [submitContact, { isLoading }] = useSubmitContactMutation()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !message.trim()) {
      setError(S.required)
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
      setError(S.failed)
    }
  }

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={S.title}
      /* Vỏ Modal phải tự khai màu nền VÀ màu chữ.
         Modal.jsx ép `bg-white` khi bên gọi không truyền lớp `bg-` nào, mà bên
         trong form lại có mấy chỗ `dark:text-*` — chế độ tối thành chữ gần trắng
         trên nền trắng, không đọc được. Phải có cả `text-`: thẻ <h2> tiêu đề trong
         Modal.jsx không có lớp màu nào, nó thừa kế, nên đổi nền sang tối mà quên
         màu chữ thì tiêu đề lại biến mất. */
      className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
      /* Bớt khoảng trống dưới tiêu đề. Mặc định của Modal là p-6 ở đầu VÀ p-6 ở
         thân, cộng lại thành 48px trắng trước dòng chữ đầu tiên — nhìn như form bị
         tụt xuống (phản hồi 03/09). */
      headerClassName="flex items-center justify-between px-4 pt-4 pb-1 sm:px-6 sm:pt-5 sm:pb-2"
      bodyClassName="px-4 pb-4 sm:px-6 sm:pb-5 flex-1 overflow-y-auto"
    >
      {done ? (
        <div className="py-2">
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            {S.doneBefore}
            <strong>{email}</strong>
            {S.doneAfter}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2 text-sm text-white"
              style={{ background: BRAND.red }}
            >
              {S.close}
            </button>
          </div>
        </div>
      ) : (
        /* gap-2.5 chứ không gap-3, email và họ tên cùng một hàng, ô nội dung 4 dòng
           chứ không 5: ba chỗ này gộp lại cắt khoảng 120px chiều cao, đủ để form
           nằm gọn trong 600px của Modal mà không sinh thanh cuộn. */
        <form onSubmit={submit} className="flex flex-col gap-2.5">
          <p className="text-xs text-neutral-500">{S.intro}</p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <TextInput
              type="email"
              label={S.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={S.emailPlaceholder}
            />
            <TextInput
              label={S.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={S.namePlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="chat-support-message"
              className="mb-1 block text-sm text-neutral-700 dark:text-neutral-200"
            >
              {S.message}
            </label>
            <textarea
              id="chat-support-message"
              rows={4}
              value={message}
              maxLength={MAX_MESSAGE}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="mt-1 text-right text-[11px] tabular-nums text-neutral-400">
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
              {S.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-white transition disabled:opacity-50"
              style={{ background: BRAND.red }}
            >
              <Send size={14} />
              {isLoading ? S.sending : S.send}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
