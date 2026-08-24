import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useForgotPasswordMutation } from "@/store/api/authApi"
import { parseApiError } from "@/shared/utils/apiError"

const RequestOtpStep = ({ onSuccess, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [apiError, setApiError] = useState("")

  const [forgotPassword, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation()

  const validateEmail = (value) => {
    if (!value) return authText.validationEmailRequired || "Vui lòng nhập email"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value))
      return authText.validationEmailInvalid || "Vui lòng nhập email hợp lệ"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmailError("")
    setApiError("")

    const emailErr = validateEmail(email.trim())
    if (emailErr) {
      setEmailError(emailErr)
      return
    }

    try {
      const emailValue = email.trim()
      await forgotPassword({ email: emailValue }).unwrap()
      onSuccess(emailValue)
    } catch (err) {
      console.error("Failed to send OTP:", err)
      const { errorCode, message } = parseApiError(err)
      if (errorCode === "AUTH_TOO_MANY_REQUESTS" || err?.status === 429) {
        setApiError(
          authText.tooManyOtpRequests ||
            "Bạn đã yêu cầu gửi mã OTP quá nhiều lần. Vui lòng đợi trong giây lát.",
        )
      } else if (
        message === "Email not found" ||
        errorCode === "AUTH_ACCOUNT_NOT_FOUND"
      ) {
        setApiError(authText.emailNotFound || "Email không tồn tại")
      } else {
        setApiError(message || authText.sendOtpFailed || "Gửi OTP thất bại.")
      }
    }
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-bold text-primary mb-2">
        {authText.forgotStep1Title || "Quên mật khẩu?"}
      </h2>
      <p className="text-center text-sm text-secondary mb-6">
        {authText.forgotStep1Subtitle ||
          "Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi mã xác thực"}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <TextInput
            label={authText.emailLabel || "Email"}
            labelClassName="text-secondary"
            required
            type="email"
            variant="square"
            autoComplete="email"
            placeholder={
              authText.emailPlaceholder ||
              authText.emailOnlyPlaceholder ||
              "Nhập email của bạn"
            }
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError("")
              setApiError("")
            }}
            error={emailError}
          />
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <PillButton
          type="submit"
          loading={isSendingOtp}
          className="w-full mb-2"
        >
          {isSendingOtp
            ? authText.sending || "Đang gửi"
            : authText.sendOtpButton || "Gửi OTP"}
        </PillButton>

        <p className="text-center text-xs text-secondary">
          {authText.haveAccount || "Bạn đã có tài khoản?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => onSwitchMode?.("login")}
          >
            {authText.loginLink || "Đăng nhập"}
          </button>
        </p>
      </form>
    </div>
  )
}

export default RequestOtpStep
