import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2, X, RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import {
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
} from "@/store/api/authApi"
import { parseApiError, resolveLocalizedError } from "@/shared/utils/apiError"
import { resolveGeneralErrorMessage } from "@/features/auth/utils/registerErrors"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import {
  clearRegistrationCorrectionToken,
  getRegistrationCorrectionToken,
  setRegistrationCorrectionToken,
} from "@/features/auth/utils/registrationCorrectionToken"
import { buildEmailCorrectionPayload } from "@/features/auth/utils/emailCorrection"

const VerifyEmailOtpPopup = ({
  open,
  onClose,
  email: initialEmail,
  onSwitchMode,
  pendingActivation = false,
}) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const navigate = useNavigate()
  const { redirectAfterLogin } = useAuthModal()

  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState(initialEmail || "")
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [requiresPassword, setRequiresPassword] = useState(false)
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
        authText.validationOtpRequired || "Vui lòng nhập mã xác thực OTP",
      )
      return
    }
    if (otpValue.length !== 6) {
      setValidationError(
        authText.validationOtpLength || "Mã OTP phải có 6 chữ số",
      )
      return
    }

    try {
      await verifyEmailOtp({ email: currentEmail, otp: otpValue }).unwrap()
      try {
        sessionStorage.setItem("catspeak_just_registered", "true")
      } catch { /* ignore storage error */ }
      onClose()
      const communityLang = localStorage.getItem("communityLanguage") || "zh"
      const targetUrl = redirectAfterLogin || `/${communityLang}/community`
      navigate(targetUrl, { replace: true })
    } catch (err) {
      setApiError(
        resolveLocalizedError(
          err,
          (e) => resolveGeneralErrorMessage(e, authText),
          authText.verifyOtpFailed || "Invalid or expired OTP.",
        ),
      )
    }
  }

  const handleResendOtp = async () => {
    setApiError("")
    setSuccessMsg("")
    try {
      await resendEmailOtp({ email: currentEmail }).unwrap()
      setSuccessMsg(
        authText.otpResentSuccess || "Mã OTP đã được gửi lại thành công",
      )
    } catch (err) {
      setApiError(
        resolveLocalizedError(
          err,
          (e) => resolveGeneralErrorMessage(e, authText),
          authText.sendOtpFailed || "Gửi OTP thất bại.",
        ),
      )
    }
  }

  const handleUpdateEmail = async () => {
    setApiError("")
    setSuccessMsg("")
    setValidationError("")
    if (!newEmail || newEmail === currentEmail) {
      setIsEditingEmail(false)
      return
    }

    const correctionToken = getRegistrationCorrectionToken()
    const usePasswordFallback = requiresPassword && Boolean(password.trim())
    if (!usePasswordFallback && !correctionToken) {
      setRequiresPassword(true)
      setApiError(
        authText.correctionPasswordRequired ||
          "Vui lòng nhập mật khẩu để xác nhận đổi email.",
      )
      return
    }

    try {
      const payload = buildEmailCorrectionPayload({
        email: currentEmail,
        newEmail,
        correctionToken,
        requiresPassword,
        password,
      })

      const result = await resendEmailOtp(payload).unwrap()
      // CS-10: only replace the in-memory token when the server rotates it.
      const nextToken =
        result?.registrationCorrectionToken ??
        result?.data?.registrationCorrectionToken
      if (nextToken) setRegistrationCorrectionToken(nextToken)
      setEmail(newEmail)
      setIsEditingEmail(false)
      setPassword("")
      setRequiresPassword(false)
      setSuccessMsg(
        authText.emailUpdatedOtpSent || "Email updated and new OTP sent",
      )
    } catch (err) {
      const { statusCode, errorCode, message } = parseApiError(err)
      if (errorCode === "AUTH_EMAIL_EXISTS") {
        setApiError(authText.emailExists || message)
        return
      }
      // Token rejected/expired -> drop it and require the password instead.
      if (
        correctionToken &&
        !usePasswordFallback &&
        (statusCode === 400 || statusCode === 401 || statusCode === 403)
      ) {
        clearRegistrationCorrectionToken()
        setRequiresPassword(true)
        setPassword("")
        setApiError(
          authText.correctionTokenExpired ||
            "Phiên đổi email đã hết hạn. Vui lòng nhập mật khẩu để xác nhận.",
        )
        return
      }
      setApiError(
        resolveLocalizedError(
          err,
          (e) => resolveGeneralErrorMessage(e, authText),
          authText.updateEmailFailed || message || "Failed to update email.",
        ),
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-lg rounded-none md:rounded-xl md:border md:border-border"
      headerClassName="flex items-center justify-between p-4 sm:p-6 pb-0"
      title={
        onSwitchMode ? (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => onSwitchMode("register")}
            title={authText.back || "Quay lại"}
          >
            <ArrowLeft />
          </IconButton>
        ) : null
      }
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="w-full">
          <PillButton
            form="verify-email-otp-form"
            type="submit"
            loading={isVerifying}
            disabled={isEditingEmail}
            className="w-full mb-2"
          >
            {isVerifying
              ? authText.verifying || "Đang xác minh"
              : authText.verifyOtpButton || "Xác minh OTP"}
          </PillButton>

          <p className="text-center text-xs text-secondary">
            <span>{authText.didntReceiveCode || "Không nhận được mã?"}</span>{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-semibold text-primary dark:text-red-400 hover:underline disabled:opacity-50 inline-flex items-center"
            >
              {isResending ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              {authText.resendOtp || "Gửi lại OTP"}
            </button>
          </p>
        </div>
      }
    >
      <div>
        <h2 className="text-center text-3xl font-bold text-primary dark:text-red-400 mb-6">
          {authText.verifyEmailTitle || "Xác minh OTP"}
        </h2>

        {pendingActivation && authText.registrationPendingActivation && (
          <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 py-3 px-4 text-sm text-amber-800 dark:text-amber-300">
            {authText.registrationPendingActivation}
          </div>
        )}

        {!isEditingEmail ? (
          <p className="mb-6 text-center text-sm text-secondary flex flex-col items-center">
            <span>
              {authText.verifyEmailSubtitle ||
                "Chúng tôi đã gửi mã 6 chữ số đến"}
            </span>
            <span className="inline-flex items-center gap-1 mt-0.5">
              <strong className="text-primary dark:text-red-400 font-bold">{currentEmail}</strong>
              <button
                type="button"
                onClick={() => {
                  setNewEmail(currentEmail)
                  setIsEditingEmail(true)
                  setRequiresPassword(!getRegistrationCorrectionToken())
                  setPassword("")
                  setApiError("")
                  setSuccessMsg("")
                }}
                className="inline-flex items-center text-primary dark:text-red-400 font-semibold text-xs hover:underline ml-1"
              >
                <Edit2 className="h-3 w-3 mr-0.5" />
                {authText.editEmail || "Edit"}
              </button>
            </span>
          </p>
        ) : (
          <div className="mb-6 w-full">
            <label className="block text-xs mb-1 text-secondary">
              {authText.newEmailPlaceholder || "Nhập email đúng"}
            </label>
            <div className="flex items-center gap-2 w-full">
              <TextInput
                type="email"
                variant="square"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                containerClassName="flex-1"
                className="w-full"
              />
              <PillButton
                type="button"
                size="sm"
                onClick={handleUpdateEmail}
                loading={isResending}
                className="shrink-0"
              >
                {authText.updateEmail || "Update"}
              </PillButton>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditingEmail(false)
                  setRequiresPassword(false)
                  setPassword("")
                }}
                title={authText.cancel || "Cancel"}
                className="shrink-0"
              >
                <X size={16} />
              </IconButton>
            </div>
            {requiresPassword && (
              <div className="mt-2">
                <label className="block text-xs mb-1 text-secondary">
                  {authText.confirmPasswordLabel || "Mật khẩu xác nhận"}
                </label>
                <TextInput
                  type="password"
                  variant="square"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    authText.confirmPasswordPlaceholder ||
                    "Nhập mật khẩu tài khoản"
                  }
                  className="w-full"
                />
                <p className="mt-1 text-xs text-secondary">
                  {authText.correctionPasswordHint ||
                    "Mã đổi email đã hết hạn, vui lòng xác nhận bằng mật khẩu."}
                </p>
              </div>
            )}
          </div>
        )}

        <form id="verify-email-otp-form" onSubmit={handleVerifyOtp}>
          <div className="mb-2">
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
            <div className="mt-4 rounded-lg bg-green-50 dark:bg-emerald-950/40 py-3 px-4 text-sm text-green-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60">
              {successMsg}
            </div>
          )}
        </form>
      </div>
    </Modal>
  )
}

export default VerifyEmailOtpPopup
