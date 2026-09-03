import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  useLoginMutation,
  useResendEmailOtpMutation,
} from "@/store/api/authApi"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import { parseApiError } from "@/shared/utils/apiError"

const LoginPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth
  const navigate = useNavigate()
  const { redirectAfterLogin } = useAuthModal()

  const [apiError, setApiError] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isNotActivatedError, setIsNotActivatedError] = useState(false)

  const [login, { isLoading }] = useLoginMutation()
  const [resendEmailOtp, { isLoading: isResendingOtp }] =
    useResendEmailOtpMutation()

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setRemember(false)
    setEmailError("")
    setPasswordError("")
    setApiError(null)
    setIsNotActivatedError(false)
    onClose()
  }

  const validateEmail = (value) => {
    if (!value) return authText.validationEmailRequired
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return authText.validationEmailInvalid
    return ""
  }

  const validatePassword = (value) =>
    !value ? authText.validationPasswordRequired : ""

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    setIsNotActivatedError(false)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passwordErr)

    if (emailErr || passwordErr) return

    try {
      await login({ email, password }).unwrap()

      handleClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      console.error("Login error:", err)
      const { statusCode, errorCode, message } = parseApiError(err)

      const isNotActivated =
        statusCode === 401 && errorCode === "AUTH_ACCOUNT_NOT_ACTIVATED"

      if (isNotActivated) {
        setIsNotActivatedError(true)
        setApiError(authText.accountNotActivated)
        return
      }

      if (
        errorCode === "AUTH_ACCOUNT_LOCKED_ATTEMPTS" ||
        errorCode === "AUTH_ACCOUNT_LOCKED"
      ) {
        setApiError(authText.accountLocked || message)
        return
      }

      if (statusCode === 429 || errorCode === "AUTH_TOO_MANY_REQUESTS") {
        setApiError(
          authText.tooManyOtpRequests ||
            "Too many requests. Please try again later.",
        )
        return
      }

      const isInvalidCredentials = errorCode === "AUTH_INVALID_CREDENTIALS"

      setApiError(
        isInvalidCredentials
          ? authText.invalidCredentials
          : message || authText.loginFailed,
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      showCloseButton={true}
      className="max-w-lg rounded-none md:rounded-xl md:border md:border-border"
      headerClassName="flex items-center justify-between p-4 sm:p-6 pb-0"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
      footer={
        <div className="w-full">
          {/* Submit */}
          <PillButton
            form="login-form"
            type="submit"
            className="w-full mb-2"
            loading={isLoading}
          >
            {authText.loginButton}
          </PillButton>

          {/* Register link */}
          <p className="text-center text-xs text-secondary">
            {authText.dontHaveAccount}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => onSwitchMode("register")}
            >
              {authText.registerLink}
            </button>
          </p>
        </div>
      }
    >
      <form id="login-form" onSubmit={handleSubmit}>
        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-primary mb-6">
          {authText.loginTitle}
        </h2>

        <div className="flex flex-col gap-6 mb-2">
          {/* Email */}
          <TextInput
            label={authText.emailLabel}
            labelClassName="text-secondary"
            required
            type="email"
            variant="square"
            autoComplete="email"
            placeholder={authText.emailPlaceholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError("")
            }}
            error={emailError}
          />

          {/* Password */}
          <TextInput
            label={authText.passwordLabel}
            labelClassName="text-secondary"
            required
            type="password"
            variant="square"
            autoComplete="current-password"
            placeholder={authText.passwordPlaceholder}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError("")
            }}
            error={passwordError}
          />
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center cursor-pointer">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="ml-2 text-sm text-secondary">
              {authText.rememberMe}
            </span>
          </label>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={() => onSwitchMode("forgot")}
          >
            {authText.forgotLink}
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mt-6 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {isNotActivatedError ? (
              <span>
                {authText.accountNotActivated}{" "}
                <button
                  type="button"
                  className="font-bold underline hover:text-red-900 disabled:opacity-50"
                  disabled={isResendingOtp}
                  onClick={async () => {
                    try {
                      await resendEmailOtp({ email }).unwrap()
                    } catch (err) {
                      const { errorCode, message } = parseApiError(err)
                      if (errorCode === "AUTH_TOO_MANY_REQUESTS") {
                        setApiError(authText.tooManyOtpRequests)
                      } else {
                        setApiError(message || authText.sendOtpFailed)
                      }
                      return
                    }
                    onSwitchMode("verify-email", email)
                  }}
                >
                  {isResendingOtp
                    ? authText.sendingOtp || "Sending OTP..."
                    : authText.clickToVerifyEmail}
                </button>
              </span>
            ) : (
              apiError
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}

export default LoginPopup
