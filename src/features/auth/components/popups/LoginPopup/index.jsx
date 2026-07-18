import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import {
  useLoginMutation,
  useResendEmailOtpMutation,
} from "@/store/api/authApi"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"

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
      const result = await login({ email, password })

      const err = result?.error
      if (err) {
        const errData = err?.data
        const errMessage = errData?.message

        const isNotActivated =
          err?.status === 401 &&
          errMessage === "Account is not activated. Please verify your email."

        if (isNotActivated) {
          setIsNotActivatedError(true)
          setApiError(errMessage)
          return
        }

        const isInvalidCredentials = errMessage === "Invalid email or password"

        setApiError(
          isInvalidCredentials
            ? authText.invalidCredentials
            : errMessage ||
                t.common?.errorGeneric ||
                authText.loginFailed ||
                "Login failed",
        )
        return
      }

      onClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      console.error("Login unexpected error:", err)
      setApiError(
        err?.data?.message ||
          err?.message ||
          t.common?.errorGeneric ||
          authText.loginFailed ||
          "Login failed",
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} showCloseButton={true} className="md:max-w-[650px]">
      <form onSubmit={handleSubmit} className="pb-6 px-2">
        {/* Title */}
        <h2 className="text-center text-[28px] font-bold text-[#990011] mb-6">
          {authText.loginTitle}
        </h2>

        <div className="flex flex-col gap-4 mb-3">
          {/* Email */}
          <div>
            <label className="block text-xs text-[#606060] mb-1">
              {authText.emailLabel}
            </label>
            <TextInput
              type="email"
              variant="round"
              autoComplete="email"
              placeholder={authText.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              error={emailError}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-[#606060] mb-1">
              {authText.passwordLabel}
            </label>
            <TextInput
              type="password"
              variant="round"
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
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm mb-5">
          <label className="inline-flex items-center cursor-pointer">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="ml-2 text-xs text-[#606060]">{authText.rememberMe}</span>
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-[#990011] hover:underline"
            onClick={() => onSwitchMode("forgot")}
          >
            {authText.forgotLink}
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 py-2 px-3 text-sm text-red-700">
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
                      const apiMsg = err?.data?.message
                      if (
                        apiMsg ===
                        "Too many OTP requests. Please try again later."
                      ) {
                        setApiError(authText.tooManyOtpRequests)
                      } else {
                        setApiError(apiMsg || "Failed to resend OTP.")
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

        {/* Submit */}
        <AuthButton
          type="submit"
          className="mb-5"
          disabled={isLoading}
        >
          {isLoading ? "..." : authText.loginButton}
        </AuthButton>

        {/* Register link */}
        <p className="text-center text-xs text-[#7A7574]">
          {authText.dontHaveAccount}{" "}
          <button
            type="button"
            className="font-semibold text-[#990011] hover:underline"
            onClick={() => onSwitchMode("register")}
          >
            {authText.registerLink}
          </button>
        </p>
      </form>
    </Modal>
  )
}

export default LoginPopup
