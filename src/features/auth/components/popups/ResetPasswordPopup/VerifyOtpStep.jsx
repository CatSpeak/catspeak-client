import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import {
  useVerifyResetOtpMutation,
  useForgotPasswordMutation,
} from "@/store/api/authApi"
import { parseApiError } from "@/shared/utils/apiError"

const VerifyOtpStep = ({ email, onSuccess, onBack, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [apiError, setApiError] = useState("")
  const [resendSuccess, setResendSuccess] = useState("")

  const [verifyResetOtp, { isLoading: isVerifyingOtp }] =
    useVerifyResetOtpMutation()
  const [resendForgotPassword, { isLoading: isResendingOtp }] =
    useForgotPasswordMutation()

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")
    setApiError("")
    setResendSuccess("")

    const otpValue = otp.trim()
    if (!otpValue) {
      setError(authText.validationOtpRequired || "Vui lòng nhập mã xác thực OTP")
      return
    }
    if (otpValue.length !== 6) {
      setError(authText.validationOtpLength || "Mã OTP phải có 6 chữ số")
      return
    }

    try {
      const result = await verifyResetOtp({
        email,
        otp: otpValue,
      }).unwrap()

      onSuccess(result.resetToken)
    } catch (err) {
      console.error("OTP verification failed:", err)
      const { message } = parseApiError(err)
      setApiError(
        message ||
          authText.verifyOtpFailed ||
          "Mã OTP không chính xác hoặc đã hết hạn.",
      )
    }
  }

  const handleResend = async () => {
    setError("")
    setApiError("")
    setResendSuccess("")
    try {
      await resendForgotPassword({ email }).unwrap()
      setResendSuccess(
        authText.otpResentSuccess || "Mã OTP đã được gửi lại thành công",
      )
    } catch (err) {
      const { errorCode, message } = parseApiError(err)
      if (errorCode === "AUTH_TOO_MANY_REQUESTS" || err?.status === 429) {
        setApiError(
          authText.tooManyOtpRequests ||
            "Bạn đã yêu cầu gửi mã OTP quá nhiều lần. Vui lòng đợi trong giây lát.",
        )
      } else {
        setApiError(message || authText.sendOtpFailed || "Gửi OTP thất bại.")
      }
    }
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-bold text-primary mb-2">
        {authText.forgotStep2Title || "Xác minh OTP"}
      </h2>
      <p className="mb-6 text-center text-sm text-secondary flex flex-col items-center">
        <span>
          {authText.forgotStep2Subtitle || "Chúng tôi đã gửi mã 6 chữ số đến"}
        </span>
        <strong className="text-primary font-bold">{email}</strong>
      </p>

      <form onSubmit={handleVerifyOtp}>
        <div className="mb-6">
          <TextInput
            label={authText.otpLabel || "Mã OTP"}
            labelClassName="text-secondary"
            required
            type="text"
            inputMode="numeric"
            variant="square"
            autoComplete="one-time-code"
            placeholder={authText.otpPlaceholder || "Nhập mã OTP 6 chữ số"}
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "")
              setOtp(numericValue)
              setError("")
              setApiError("")
              setResendSuccess("")
            }}
            className="text-center text-lg tracking-widest"
            error={error}
          />
        </div>

        {resendSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 py-3 px-4 text-sm text-green-700 text-center">
            {resendSuccess}
          </div>
        )}

        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <PillButton
          type="submit"
          loading={isVerifyingOtp}
          className="w-full mb-4"
        >
          {isVerifyingOtp
            ? authText.verifying || "Đang xác minh"
            : authText.verifyOtpButton || "Xác minh OTP"}
        </PillButton>

        <p className="text-center text-xs text-secondary">
          <span>{authText.didntReceiveCode || "Không nhận được mã?"}</span>{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendingOtp}
            className="font-semibold text-primary hover:underline disabled:opacity-50 inline-flex items-center"
          >
            {isResendingOtp ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : null}
            {isResendingOtp
              ? authText.sendingOtp || "Đang gửi OTP"
              : authText.resendOtp || "Gửi lại OTP"}
          </button>
        </p>
      </form>
    </div>
  )
}

export default VerifyOtpStep
