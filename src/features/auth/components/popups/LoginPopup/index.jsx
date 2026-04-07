import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import { useLoginMutation } from "@/store/api/authApi"
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
  const [showPassword, setShowPassword] = useState(false)

  const [login, { isLoading }] = useLoginMutation()

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

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passwordErr)

    if (emailErr || passwordErr) return

    try {
      await login({ email, password }).unwrap()
      onClose()
      if (redirectAfterLogin) navigate(redirectAfterLogin, { replace: true })
    } catch (err) {
      const isInvalidCredentials =
        err?.status === 401 ||
        err?.data?.message === "Invalid email or password" ||
        err?.message === "Invalid email or password"

      setApiError(
        isInvalidCredentials
          ? authText.invalidCredentials
          : err?.data?.message ||
              err.message ||
              t.common?.errorGeneric ||
              "Login failed",
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-center text-3xl font-black text-[#8f0d15] mb-6">
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
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                variant="square"
                autoComplete="current-password"
                placeholder={authText.passwordPlaceholder}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError("")
                }}
                className={`pr-12 ${passwordError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
          <p className="mb-2 rounded-lg bg-red-100 h-10 flex items-center px-3 text-sm text-red-700">
            {apiError}
          </p>
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
