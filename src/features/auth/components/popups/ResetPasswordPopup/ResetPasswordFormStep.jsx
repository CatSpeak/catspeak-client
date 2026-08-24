import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
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
        resetToken: token,
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
      <h2 className="text-center text-3xl font-bold text-primary mb-6">
        {authText.forgotStep3Title || "Đặt mật khẩu mới"}
      </h2>

      <form onSubmit={handleResetPassword}>
        <div className="flex flex-col gap-6 mb-6">
          {/* New Password */}
          <TextInput
            label={authText.newPasswordLabel || "Mật khẩu mới"}
            labelClassName="text-secondary"
            required
            variant="square"
            type="password"
            autoComplete="new-password"
            placeholder={
              authText.newPasswordPlaceholder || "Nhập mật khẩu mới"
            }
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setNewPasswordError("")
            }}
            error={newPasswordError}
          />

          {/* Confirm Password */}
          <TextInput
            label={authText.confirmPasswordLabel || "Xác nhận mật khẩu"}
            labelClassName="text-secondary"
            required
            variant="square"
            type="password"
            autoComplete="new-password"
            placeholder={
              authText.confirmPasswordPlaceholder || "Xác nhận lại mật khẩu"
            }
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setConfirmPasswordError("")
            }}
            error={confirmPasswordError}
          />
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <PillButton type="submit" loading={isResetting} className="w-full">
          {authText.resetPasswordButton || "Đặt lại mật khẩu"}
        </PillButton>
      </form>
    </div>
  )
}

export default ResetPasswordFormStep

