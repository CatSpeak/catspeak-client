import { useState } from "react"
import { Send, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useSubmitContactMutation } from "@/store/api/contactApi"
import Modal from "@/shared/components/ui/Modal"

const initialForm = {
  name: "",
  email: "",
  phone: "",
  languageInterest: "Cả 3 ngôn ngữ (Anh - Trung - Nhật)",
  contactNeed: "Hợp tác Đối tác Doanh nghiệp / Trung tâm ngoại ngữ",
  message: "",
}

const LandingContactForm = () => {
  const { language } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [submitContact, { isLoading }] = useSubmitContactMutation()
  const [notice, setNotice] = useState({
    open: false,
    title: "",
    message: "",
  })

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const message = [
      `Nhu cầu liên hệ: ${form.contactNeed}`,
      `Ngôn ngữ quan tâm: ${form.languageInterest}`,
      form.phone.trim() ? `Số điện thoại / Zalo: ${form.phone.trim()}` : "",
      "",
      form.message.trim(),
    ]
      .filter(Boolean)
      .join("\n")

    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message,
        language,
      }).unwrap()

      setNotice({
        open: true,
        title: "Gửi thông tin thành công",
        message: "Cảm ơn bạn đã liên hệ. CAT SPEAK sẽ phản hồi sớm nhất có thể.",
      })
      setForm(initialForm)
    } catch (error) {
      console.error("Failed to submit contact form:", error)
      setNotice({
        open: true,
        title: "Gửi thông tin thất bại",
        message: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau.",
      })
    }
  }

  const inputClassName =
    "mt-1.5 h-10 w-full rounded-lg border border-[#d6d6d6] bg-[#fafafa] px-3 text-sm text-[#222] outline-none transition focus:border-[#A90016] focus:ring-2 focus:ring-[#A90016]/15 dark:border-[#484848] dark:bg-[#2b2b2b] dark:text-gray-100 dark:placeholder:text-gray-500"

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm dark:border-[#343434] dark:bg-[#202020] sm:p-7 lg:p-8"
      >
        <h2 className="text-lg font-bold text-[#222] dark:text-white">
          Gửi biểu mẫu liên hệ &amp; Hợp tác
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Vui lòng điền thông tin bên dưới, chuyên viên hỗ trợ sẽ liên hệ lại với bạn.
        </p>

        <div className="mt-5 grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            Họ và tên <span className="text-[#A90016]">*</span>
            <input
              autoComplete="name"
              className={inputClassName}
              name="name"
              onChange={updateField}
              placeholder="VD: Trần Hoàng Nam"
              required
              value={form.name}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            Địa chỉ Email <span className="text-[#A90016]">*</span>
            <input
              autoComplete="email"
              className={inputClassName}
              name="email"
              onChange={updateField}
              placeholder="VD: name@company.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            Số điện thoại / Zalo
            <input
              autoComplete="tel"
              className={inputClassName}
              name="phone"
              onChange={updateField}
              placeholder="VD: 0868192604"
              type="tel"
              value={form.phone}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            Ngôn ngữ quan tâm
            <select
              className={inputClassName}
              name="languageInterest"
              onChange={updateField}
              value={form.languageInterest}
            >
              <option>Cả 3 ngôn ngữ (Anh - Trung - Nhật)</option>
              <option>Tiếng Anh</option>
              <option>Tiếng Trung</option>
              <option>Tiếng Nhật</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200 sm:col-span-2">
            Nhu cầu liên hệ
            <select
              className={inputClassName}
              name="contactNeed"
              onChange={updateField}
              value={form.contactNeed}
            >
              <option>
                Hợp tác Đối tác Doanh nghiệp / Trung tâm ngoại ngữ
              </option>
              <option>Đăng ký luyện nói cá nhân</option>
              <option>Tư vấn cho trường học / câu lạc bộ</option>
              <option>Khác</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200 sm:col-span-2">
            Nội dung tin nhắn <span className="text-[#A90016]">*</span>
            <textarea
              className={`${inputClassName} h-20 resize-y py-2`}
              name="message"
              onChange={updateField}
              placeholder="Mô tả chi tiết câu hỏi hoặc nhu cầu của bạn..."
              required
              value={form.message}
            />
          </label>
        </div>

        <button
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#A90016] text-sm font-bold text-white transition-colors hover:bg-[#890012] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Đang gửi..." : "Gửi thông tin liên hệ"}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Thông tin liên hệ của bạn được bảo mật tuyệt đối
        </p>
      </form>

      <Modal
        open={notice.open}
        onClose={() => setNotice((current) => ({ ...current, open: false }))}
        title={notice.title}
      >
        <p className="text-gray-700 dark:text-gray-200">{notice.message}</p>
      </Modal>
    </>
  )
}

export default LandingContactForm
