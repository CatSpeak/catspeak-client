import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Hash, Edit2, X, RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import {
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
} from "@/store/api/authApi"
import { useAuthModal } from "@/shared/context/AuthModalContext"

const VerifyEmailOtpPopup = ({ open, onClose, email: initialEmail, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const navigate = useNavigate()
  const { redirectAfterLogin } = useAuthModal()

  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState(initialEmail || "")
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [apiError, setApiError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [validationError, setValidationError] = useState("")

  useEffect(() => {
    if (initialEmail && open) {
      setEmail(initialEmail)
    }
  }, [initialEmail, open])

  const [verifyEmailOtp, { isLoading: isVerifying }] =
    useVerifyEmailOtpMutation()
  const [resendEmailOtp, { isLoading: isResending }] =
    useResendEmailOtpMutation()

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setApiError("")
    setSuccessMsg("")
    setValidationError("")

    const otpValue = otp.trim()
    if (!otpValue) {
      setValidationError(authText.validationOtpRequired || "Please enter the OTP!")
      return
    }
    if (otpValue.length !== 6) {
      setValidationError(authText.validationOtpLength || "OTP must be 6 digits")
      return
    }

    try {
      await verifyEmailOtp({ email, otp: otpValue }).unwrap()
      onClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      const apiMsg = err?.data?.message
      setApiError(
        apiMsg === "Invalid or expired OTP"
          ? authText.verifyOtpFailed
          : apiMsg || authText.verifyOtpFailed || "Invalid or expired OTP."
      )
    }
  }

  const handleResendOtp = async () => {
    setApiError("")
    setSuccessMsg("")
    try {
      await resendEmailOtp({ email }).unwrap()
      setSuccessMsg(authText.otpResentSuccess || "OTP has been resent successfully")
    } catch (err) {
      const apiMsg = err?.data?.message
      setApiError(
        apiMsg === "Too many OTP requests. Please try again later."
          ? authText.tooManyOtpRequests
          : apiMsg || "Failed to resend OTP."
      )
    }
  }

  const handleUpdateEmail = async () => {
    setApiError("")
    setSuccessMsg("")
    if (!newEmail || newEmail === email) {
      setIsEditingEmail(false)
      return
    }

    try {
      await resendEmailOtp({ email, newEmail }).unwrap()
      setEmail(newEmail)
      setIsEditingEmail(false)
      setSuccessMsg("Email updated and new OTP sent")
    } catch (err) {
      setApiError(err?.data?.message || "Failed to update email.")
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="pb-6">
        <h2 className="mb-2 text-center text-3xl font-bold text-[#8f0d15]">
          {authText.verifyEmailTitle || "Verify Your Email"}
        </h2>
        
        {!isEditingEmail ? (
          <div className="mb-6 text-center text-sm text-[#7A7574]">
            {authText.verifyEmailSubtitle || "We've sent a 6-digit code to"}{" "}
            <strong className="text-black">{email}</strong>
            <button
              type="button"
              onClick={() => {
                setNewEmail(email)
                setIsEditingEmail(true)
                setApiError("")
                setSuccessMsg("")
              }}
              className="ml-2 inline-flex items-center text-[#990011] hover:underline"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              {authText.editEmail || "Edit"}
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-xs mb-1 text-gray-600">
              {authText.newEmailPlaceholder || "Enter correct email"}
            </label>
            <div className="flex gap-2">
              <TextInput
                type="email"
                variant="square"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleUpdateEmail}
                disabled={isResending}
                className="px-3 py-2 bg-[#990011] text-white rounded text-sm font-semibold disabled:opacity-50"
              >
                {isResending ? "..." : (authText.updateEmail || "Update")}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
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
                  setValidationError("")
                  setApiError("")
                }}
                className={`pl-10 text-center text-lg tracking-widest ${
                  validationError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""
                }`}
              />
            </div>
            {validationError && <p className="mt-1 text-xs text-red-600">{validationError}</p>}
          </div>

          {apiError && (
            <p className="mb-4 rounded-lg bg-red-100 py-2 px-3 text-sm text-red-700">
              {apiError}
            </p>
          )}
          {successMsg && (
            <p className="mb-4 rounded-lg bg-green-100 py-2 px-3 text-sm text-green-700">
              {successMsg}
            </p>
          )}

          <AuthButton
            type="submit"
            disabled={isVerifying || isEditingEmail}
            className="w-full rounded-lg mb-4"
          >
            {isVerifying
              ? authText.verifying || "VERIFYING..."
              : authText.verifyOtpButton?.toUpperCase() || "VERIFY OTP"}
          </AuthButton>

          <div className="text-center text-sm">
            <span className="text-[#7A7574]">
              {authText.didntReceiveCode || "Didn't receive the code?"}
            </span>{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-semibold text-[#990011] hover:underline disabled:opacity-50 inline-flex items-center"
            >
              {isResending ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : null}
              {authText.resendOtp || "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default VerifyEmailOtpPopup
