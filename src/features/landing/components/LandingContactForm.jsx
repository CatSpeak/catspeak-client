import { useState } from "react"
import { Send, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useSubmitContactMutation } from "@/store/api/contactApi"
import Modal from "@/shared/components/ui/Modal"

const FALLBACK_LANGUAGE_OPTIONS = [
  "Cả 3 ngôn ngữ (Anh - Trung - Nhật)",
  "Tiếng Anh",
  "Tiếng Trung",
  "Tiếng Nhật",
]

const FALLBACK_NEED_OPTIONS = [
  "Hợp tác Đối tác Doanh nghiệp / Trung tâm ngoại ngữ",
  "Đăng ký luyện nói cá nhân",
  "Tư vấn cho trường học / câu lạc bộ",
  "Khác",
]

const REQUIRED_FIELDS = ["name", "email", "message"]

const LandingContactForm = () => {
  const { t, language } = useLanguage()
  const formText = t?.landing?.contactForm || {}
  const languageOptions =
    formText.languageOptions?.length > 0
      ? formText.languageOptions
      : FALLBACK_LANGUAGE_OPTIONS
  const needOptions =
    formText.needOptions?.length > 0
      ? formText.needOptions
      : FALLBACK_NEED_OPTIONS
  const whitespaceError =
    formText.requiredWhitespace || "Vui lòng không chỉ nhập khoảng trắng."

  const initialForm = {
    name: "",
    email: "",
    phone: "",
    languageInterest: languageOptions[0],
    contactNeed: needOptions[0],
    message: "",
  }

  const [form, setForm] = useState(initialForm)
  const [submitContact, { isLoading }] = useSubmitContactMutation()
  const [notice, setNotice] = useState({
    open: false,
    title: "",
    message: "",
  })

  // Keep the two selects aligned with the current interface language. The
  // options are translated, so a value chosen under another language would no
  // longer match any <option> and would be submitted with the wrong language.
  const selectedLanguageInterest = languageOptions.includes(
    form.languageInterest,
  )
    ? form.languageInterest
    : languageOptions[0]
  const selectedContactNeed = needOptions.includes(form.contactNeed)
    ? form.contactNeed
    : needOptions[0]

  const validateField = (element) => {
    if (!element || !REQUIRED_FIELDS.includes(element.name)) return true
    const value = element.value ?? ""
    if (value.length > 0 && value.trim().length === 0) {
      element.setCustomValidity(whitespaceError)
      return false
    }
    element.setCustomValidity("")
    return true
  }

  const updateField = (event) => {
    const element = event.target
    const { name, value } = element
    setForm((current) => ({ ...current, [name]: value }))
    validateField(element)
  }

  const handleInvalid = (event) => {
    validateField(event.target)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget

    const invalidField = REQUIRED_FIELDS.find(
      (field) => !(form[field] ?? "").trim(),
    )
    if (invalidField) {
      const element = formElement?.elements?.[invalidField]
      if (element) {
        const value = form[invalidField] ?? ""
        element.setCustomValidity(
          value.length > 0 ? whitespaceError : "",
        )
        element.reportValidity?.()
        element.focus?.()
      }
      return
    }

    const message = [
      `${formText.messagePrefixNeed || "Nhu cầu liên hệ:"} ${selectedContactNeed}`,
      `${formText.messagePrefixLanguage || "Ngôn ngữ quan tâm:"} ${selectedLanguageInterest}`,
      form.phone.trim()
        ? `${formText.messagePrefixPhone || "Số điện thoại / Zalo:"} ${form.phone.trim()}`
        : "",
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
        title: formText.successTitle || "Gửi thông tin thành công",
        message:
          formText.successMessage ||
          "Cảm ơn bạn đã liên hệ. CAT SPEAK sẽ phản hồi sớm nhất có thể.",
      })
      setForm(initialForm)
    } catch (error) {
      console.error("Failed to submit contact form:", error)
      setNotice({
        open: true,
        title: formText.errorTitle || "Gửi thông tin thất bại",
        message:
          formText.errorMessage ||
          "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau.",
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
          {formText.title || "Gửi biểu mẫu liên hệ & Hợp tác"}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formText.subtitle ||
            "Vui lòng điền thông tin bên dưới, chuyên viên hỗ trợ sẽ liên hệ lại với bạn."}
        </p>

        <div className="mt-5 grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            {formText.nameLabel || "Họ và tên"}{" "}
            <span className="text-[#A90016]">*</span>
            <input
              autoComplete="name"
              className={inputClassName}
              name="name"
              onChange={updateField}
              onInvalid={handleInvalid}
              placeholder={formText.namePlaceholder || "VD: Trần Hoàng Nam"}
              required
              value={form.name}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            {formText.emailLabel || "Địa chỉ Email"}{" "}
            <span className="text-[#A90016]">*</span>
            <input
              autoComplete="email"
              className={inputClassName}
              name="email"
              onChange={updateField}
              onInvalid={handleInvalid}
              placeholder={formText.emailPlaceholder || "VD: name@company.com"}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            {formText.phoneLabel || "Số điện thoại / Zalo"}
            <input
              autoComplete="tel"
              className={inputClassName}
              name="phone"
              onChange={updateField}
              placeholder={formText.phonePlaceholder || "VD: 0868192604"}
              type="tel"
              value={form.phone}
            />
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200">
            {formText.languageLabel || "Ngôn ngữ quan tâm"}
            <select
              className={inputClassName}
              name="languageInterest"
              onChange={updateField}
              value={selectedLanguageInterest}
            >
              {languageOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200 sm:col-span-2">
            {formText.needLabel || "Nhu cầu liên hệ"}
            <select
              className={inputClassName}
              name="contactNeed"
              onChange={updateField}
              value={selectedContactNeed}
            >
              {needOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-[#222] dark:text-gray-200 sm:col-span-2">
            {formText.messageLabel || "Nội dung tin nhắn"}{" "}
            <span className="text-[#A90016]">*</span>
            <textarea
              className={`${inputClassName} h-20 resize-y py-2`}
              name="message"
              onChange={updateField}
              onInvalid={handleInvalid}
              placeholder={
                formText.messagePlaceholder ||
                "Mô tả chi tiết câu hỏi hoặc nhu cầu của bạn..."
              }
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
          {isLoading
            ? formText.submitting || "Đang gửi..."
            : formText.submit || "Gửi thông tin liên hệ"}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {formText.privacyNote ||
            "Thông tin liên hệ của bạn được bảo mật tuyệt đối"}
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
