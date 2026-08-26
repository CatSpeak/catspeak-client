import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useResetPasswordMutation } from "@/store/api/authApi"
import { parseApiError } from "@/shared/utils/apiError"

const ResetPasswordFormStep = ({ email, token, onSuccess, onSwitchMode }) => {
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
        "Vui lòng nhập mật khẩu mới"
      )
    if (value.length < 6)
      return (
        authText.validationPasswordMin ||
        "Mật khẩu phải có ít nhất 6 ký tự"
      )
    return ""
  }

  const validateConfirmPassword = (newPass, confirmPass) => {
    if (!confirmPass)
      return (
        authText.validationConfirmPasswordRequired ||
        "Vui lòng xác nhận mật khẩu"
      )
    if (newPass !== confirmPass)
      return (
        authText.validationPasswordMatch || "Hai mật khẩu không khớp"
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
      const { message } = parseApiError(err)
      setApiError(
        message ||
          authText.resetPasswordFailed ||
          "Đặt lại mật khẩu thất bại.",
      )
    }
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-bold text-primary mb-2">
        {authText.forgotStep3Title || "Đặt mật khẩu mới"}
      </h2>
      <p className="text-center text-sm text-secondary mb-6">
        {authText.forgotStep3Subtitle ||
          "Tạo mật khẩu mạnh cho tài khoản của bạn"}
      </p>

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
            placeholder={authText.newPasswordPlaceholder || "Nhập mật khẩu mới"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setNewPasswordError("")
              setApiError("")
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
              authText.confirmPasswordPlaceholder || "Xác nhận mật khẩu mới"
            }
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setConfirmPasswordError("")
              setApiError("")
            }}
            error={confirmPasswordError}
          />
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 py-3.5 px-4 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <PillButton
          type="submit"
          loading={isResetting}
          className="w-full mb-2"
        >
          {isResetting
            ? authText.resetting || "Đang đặt lại mật khẩu"
            : authText.resetPasswordButton || "Đặt lại mật khẩu"}
        </PillButton>

        <p className="text-center text-xs text-secondary">
          {authText.haveAccount || "Bạn đã có tài khoản?"}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => onSwitchMode?.("login")}
          >
            {authText.loginLink || "Đăng nhập"}
          </button>
        </p>
      </form>
    </div>
  )
}

export default ResetPasswordFormStep
