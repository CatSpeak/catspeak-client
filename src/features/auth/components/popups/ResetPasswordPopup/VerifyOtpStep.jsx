import { useState } from "react"
import { ArrowLeft, Hash } from "lucide-react"
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
      await verifyResetOtp({
        email,
        otp: otpValue,
      }).unwrap()

      onSuccess(otpValue)
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
          className="flex items-center text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {authText.back || "Back"}
        </button>
      </div>

      <h2 className="mb-1 text-center text-3xl font-black text-[#8f0d15]">
        {authText.forgotStep2Title || "Verify OTP"}
      </h2>
      <p className="mb-6 text-center text-sm text-[#7A7574]">
        {authText.forgotStep2Subtitle || "Enter the 6-digit code sent to"}{" "}
        <strong className="text-black">{email}</strong>
      </p>

      <form onSubmit={handleVerifyOtp}>
        <div className="mb-6">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <TextInput
              type="text"
              variant="square"
              placeholder={authText.otpPlaceholder || "Enter 6-digit OTP"}
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setError("")
              }}
              className={`pl-10 text-center text-lg tracking-widest ${error ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""}`}
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <AuthButton
          type="submit"
          disabled={isVerifyingOtp}
          className="w-full rounded-lg"
        >
          {isVerifyingOtp
            ? authText.verifying || "VERIFYING..."
            : authText.verifyOtpButton?.toUpperCase() || "VERIFY CODE"}
        </AuthButton>
      </form>
    </div>
  )
}

export default VerifyOtpStep
