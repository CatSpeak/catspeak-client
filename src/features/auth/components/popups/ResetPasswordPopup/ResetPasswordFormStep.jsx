import { useState } from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useResetPasswordMutation } from "@/store/api/authApi"

const ResetPasswordFormStep = ({ email, token, onSuccess }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newPasswordError, setNewPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [apiError, setApiError] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const validateNewPassword = (value) => {
    if (!value)
      return (
        authText.validationNewPasswordRequired ||
        "Please input your new password!"
      )
    if (value.length < 6)
      return (
        authText.validationPasswordMin ||
        "Password must be at least 6 characters!"
      )
    return ""
  }

  const validateConfirmPassword = (newPass, confirmPass) => {
    if (!confirmPass)
      return (
        authText.validationConfirmPasswordRequired ||
        "Please confirm your password!"
      )
    if (newPass !== confirmPass)
      return (
        authText.validationPasswordMatch || "The two passwords do not match!"
      )
    return ""
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setApiError("")

    const newPassErr = validateNewPassword(newPassword)
    const confirmPassErr = validateConfirmPassword(newPassword, confirmPassword)

    setNewPasswordError(newPassErr)
    setConfirmPasswordError(confirmPassErr)

    if (newPassErr || confirmPassErr) return

    try {
      await resetPassword({
        email,
        token: token,
        newPassword: newPassword,
      }).unwrap()

      onSuccess()
    } catch (err) {
      console.error("Reset password failed:", err)
      setApiError(
        err?.data?.message ||
          authText.resetPasswordFailed ||
          "Failed to reset password.",
      )
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-center text-3xl font-black text-[#8f0d15]">
        {authText.forgotStep3Title || "Reset Password"}
      </h2>
      <p className="mb-6 text-center text-sm text-[#7A7574]">
        {authText.forgotStep3Subtitle ||
          "Create a new password for your account."}
      </p>

      <form onSubmit={handleResetPassword}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="mb-2 block text-sm">
              {authText.newPasswordLabel || "New Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <TextInput
                variant="square"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={
                  authText.newPasswordPlaceholder || "Enter new password"
                }
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setNewPasswordError("")
                }}
                className={`pl-10 pr-12 ${newPasswordError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {newPasswordError && (
              <p className="mt-1 text-xs text-red-600">{newPasswordError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm">
              {authText.confirmPasswordLabel || "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <TextInput
                variant="square"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={
                  authText.confirmPasswordPlaceholder || "Confirm new password"
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmPasswordError("")
                }}
                className={`pl-10 pr-12 ${confirmPasswordError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1 text-xs text-red-600">
                {confirmPasswordError}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <p className="mb-2 rounded-lg bg-red-100 h-10 flex items-center px-3 text-sm text-red-700">
            {apiError}
          </p>
        )}

        <AuthButton
          type="submit"
          disabled={isResetting}
          className="w-full rounded-lg"
        >
          {authText.resetPasswordButton || "Reset Password"}
        </AuthButton>
      </form>
    </div>
  )
}

export default ResetPasswordFormStep
