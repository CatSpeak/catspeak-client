import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2, X, RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import {
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
} from "@/store/api/authApi"
import { useAuthModal } from "@/shared/context/AuthModalContext"

const VerifyEmailOtpPopup = ({
  open,
  onClose,
  email: initialEmail,
  onSwitchMode,
}) => {
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

  const currentEmail = email || initialEmail || ""

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
      setValidationError(
        authText.validationOtpRequired || "Please enter the OTP!",
      )
      return
    }
    if (otpValue.length !== 6) {
      setValidationError(authText.validationOtpLength || "OTP must be 6 digits")
      return
    }

    try {
      await verifyEmailOtp({ email: currentEmail, otp: otpValue }).unwrap()
      onClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      const apiMsg = err?.data?.message
      setApiError(
        apiMsg === "Invalid or expired OTP"
          ? authText.verifyOtpFailed
          : apiMsg || authText.verifyOtpFailed || "Invalid or expired OTP.",
      )
    }
  }

  const handleResendOtp = async () => {
    setApiError("")
    setSuccessMsg("")
    try {
      await resendEmailOtp({ email: currentEmail }).unwrap()
      setSuccessMsg(
        authText.otpResentSuccess || "OTP has been resent successfully",
      )
    } catch (err) {
      const apiMsg = err?.data?.message
      setApiError(
        apiMsg === "Too many OTP requests. Please try again later."
          ? authText.tooManyOtpRequests
          : apiMsg || "Failed to resend OTP.",
      )
    }
  }

  const handleUpdateEmail = async () => {
    setApiError("")
    setSuccessMsg("")
    if (!newEmail || newEmail === currentEmail) {
      setIsEditingEmail(false)
      return
    }

    try {
      await resendEmailOtp({ email: currentEmail, newEmail }).unwrap()
      setEmail(newEmail)
      setIsEditingEmail(false)
      setSuccessMsg("Email updated and new OTP sent")
    } catch (err) {
      setApiError(err?.data?.message || "Failed to update email.")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-lg rounded-none md:rounded-xl md:border md:border-border"
      headerClassName="flex items-center justify-between p-4 sm:p-6 pb-0"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
    >
      <div>
        {/* Back to register link (optional) */}
        {onSwitchMode && (
          <div className="mb-2 flex items-center">
            <button
              type="button"
              onClick={() => onSwitchMode("register")}
              className="flex items-center text-sm font-semibold text-primary hover:underline transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {authText.back || "Quay lại"}
            </button>
          </div>
        )}

        <h2 className="text-center text-3xl font-bold text-primary mb-2">
          {authText.verifyEmailTitle || "Xác minh OTP"}
        </h2>

        {!isEditingEmail ? (
          <p className="mb-6 text-center text-sm text-secondary flex flex-col items-center">
            <span>
              {authText.verifyEmailSubtitle || "Chúng tôi đã gửi mã 6 chữ số đến"}
            </span>
            <span className="inline-flex items-center gap-1 mt-0.5">
              <strong className="text-primary font-bold">{currentEmail}</strong>
              <button
                type="button"
                onClick={() => {
                  setNewEmail(currentEmail)
                  setIsEditingEmail(true)
                  setApiError("")
                  setSuccessMsg("")
                }}
                className="inline-flex items-center text-primary font-semibold text-xs hover:underline ml-1"
              >
                <Edit2 className="h-3 w-3 mr-0.5" />
                {authText.editEmail || "Edit"}
              </button>
            </span>
          </p>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-border rounded-xl">
            <label className="block text-xs mb-1 text-secondary">
              {authText.newEmailPlaceholder || "Nhập email đúng"}
            </label>
            <div className="flex gap-2">
              <TextInput
                type="email"
                variant="square"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
              />
              <PillButton
                type="button"
                size="sm"
                onClick={handleUpdateEmail}
                loading={isResending}
              >
                {authText.updateEmail || "Update"}
              </PillButton>
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="p-2 text-secondary hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-6">
            <TextInput
              type="text"
              inputMode="numeric"
              variant="square"
              placeholder={authText.otpPlaceholder || "Nhập mã OTP 6 chữ số"}
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "")
                setOtp(numericValue)
                setValidationError("")
                setApiError("")
              }}
              className="text-center text-lg tracking-widest"
              error={validationError || apiError}
            />
          </div>

          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-50 py-3 px-4 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <PillButton
            type="submit"
            loading={isVerifying}
            disabled={isEditingEmail}
            className="w-full mb-4"
          >
            {isVerifying
              ? authText.verifying || "ĐANG XÁC MINH..."
              : authText.verifyOtpButton || "Xác minh OTP"}
          </PillButton>

          <p className="text-center text-xs text-secondary">
            <span>
              {authText.didntReceiveCode || "Didn't receive the code?"}
            </span>{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-semibold text-primary hover:underline disabled:opacity-50 inline-flex items-center"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              {authText.resendOtp || "Resend OTP"}
            </button>
          </p>
        </form>
      </div>
    </Modal>
  )
}

export default VerifyEmailOtpPopup

