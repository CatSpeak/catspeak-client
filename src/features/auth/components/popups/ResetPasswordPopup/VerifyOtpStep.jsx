import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useVerifyResetOtpMutation } from "@/store/api/authApi"

const VerifyOtpStep = ({ email, onSuccess, onBack }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  const [verifyResetOtp, { isLoading: isVerifyingOtp }] =
    useVerifyResetOtpMutation()

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")

    const otpValue = otp.trim()
    if (!otpValue) {
      setError(authText.validationOtpRequired || "Please enter the OTP!")
      return
    }
    if (otpValue.length !== 6) {
      setError(authText.validationOtpLength || "OTP must be 6 digits")
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
      setError(
        err?.data?.message ||
          authText.verifyOtpFailed ||
          "Invalid or expired OTP.",
      )
    }
  }

  return (
    <div className="pb-2">
      <div className="mb-2 flex items-center justify-start">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm font-semibold text-[#990011] transition-colors hover:text-[#7a000d]"
        >
          <ArrowLeft className="mr-1 h-4 w-4 " />
          {authText.back || "Quay lại"}
        </button>
      </div>

      <h2 className="mb-1 text-center text-[28px] font-bold text-[#990011]">
        {authText.forgotStep2Title || "Xác minh OTP"}
      </h2>
      <p className="mb-6 text-center text-sm text-[#7A7574] flex flex-col">
        {authText.forgotStep2Subtitle || "Chúng tôi đã gửi mã 6 chữ số đến"}{" "}
        <strong className="text-[#F4AB1B]">{email}</strong>
      </p>

      <form onSubmit={handleVerifyOtp}>
        <div className="mb-6">
          <TextInput
            type="text"
            variant="round"
            placeholder={authText.otpPlaceholder || "Nhập mã OTP 6 chữ số"}
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              setOtp(numericValue);
              setError("");
            }}
            className={`text-center text-lg tracking-widest ${error ? "!border-red-600 focus:!border-red-600" : ""}`}
            error={error}
          />
        </div>

        <AuthButton
          type="submit"
          disabled={isVerifyingOtp}
          className="w-1/2 rounded-full"
        >
          {isVerifyingOtp
            ? authText.verifying || "ĐANG XÁC MINH..."
            : authText.verifyOtpButton || "Xác minh OTP"}
        </AuthButton>
      </form>
    </div>
  );
}

export default VerifyOtpStep
