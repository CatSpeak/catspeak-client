import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import { useLoginMutation, useResendEmailOtpMutation } from "@/store/api/authApi"
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
  const [resendEmailOtp, { isLoading: isResendingOtp }] = useResendEmailOtpMutation()

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

      // Check for errors in the result (RTK Query shape)
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

        const isInvalidCredentials =
          err?.status === 401 ||
          errMessage === "Invalid email or password"

        setApiError(
          isInvalidCredentials
            ? authText.invalidCredentials
            : errMessage ||
                t.common?.errorGeneric ||
                "Login failed",
        )
        return
      }

      // Success — close modal and redirect
      onClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      console.error("Login unexpected error:", err)
      setApiError(
        err?.data?.message ||
          err?.message ||
          t.common?.errorGeneric ||
          "Login failed",
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="pb-6">
        <h2 className="text-center text-3xl font-bold text-[#8f0d15] mb-6">
          {authText.loginTitle}
        </h2>

        <div className="space-y-4 mb-2">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">{authText.emailLabel}</label>
            <TextInput
              type="email"
              variant="square"
              autoComplete="email"
              placeholder={authText.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              className={
                emailError
                  ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
                  : ""
              }
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1">
              {authText.passwordLabel}
            </label>
            <TextInput
              type="password"
              variant="square"
              autoComplete="current-password"
              placeholder={authText.passwordPlaceholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError("")
              }}
              className={passwordError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            )}
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm mb-6">
          <label className="inline-flex items-center">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="ml-2">{authText.rememberMe}</span>
          </label>
          <button
            type="button"
            className="font-semibold text-[#990011] hover:underline"
            onClick={() => onSwitchMode("forgot")}
          >
            {authText.forgotLink}
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-2 rounded-lg bg-red-100 min-h-10 py-2 flex items-center px-3 text-sm text-red-700">
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
                      if (apiMsg === "Too many OTP requests. Please try again later.") {
                        setApiError(authText.tooManyOtpRequests)
                      } else {
                        setApiError(apiMsg || "Failed to resend OTP.")
                      }
                      return
                    }
                    onSwitchMode("verify-email", email)
                  }}
                >
                  {isResendingOtp ? authText.sendingOtp || "Sending OTP..." : authText.clickToVerifyEmail}
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
          className="w-full rounded-lg mb-6"
          disabled={isLoading}
        >
          {isLoading ? "..." : authText.loginButton.toUpperCase()}
        </AuthButton>

        {/* Register link */}
        <p className="text-center text-sm text-[#7A7574]">
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
