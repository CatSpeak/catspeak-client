import { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import AuthButton from "../../ui/AuthButton";
import TextInput from "@/shared/components/ui/inputs/TextInput";
import { useResetPasswordMutation } from "@/store/api/authApi";

const ResetPasswordFormStep = ({ email, token, onSuccess }) => {
  const { t } = useLanguage();
  const authText = t.auth || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const validateNewPassword = (value) => {
    if (!value)
      return (
        authText.validationNewPasswordRequired ||
        "Please input your new password!"
      );
    if (value.length < 6)
      return (
        authText.validationPasswordMin ||
        "Password must be at least 6 characters!"
      );
    return "";
  };

  const validateConfirmPassword = (newPass, confirmPass) => {
    if (!confirmPass)
      return (
        authText.validationConfirmPasswordRequired ||
        "Please confirm your password!"
      );
    if (newPass !== confirmPass)
      return (
        authText.validationPasswordMatch || "The two passwords do not match!"
      );
    return "";
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError("");

    const newPassErr = validateNewPassword(newPassword);
    const confirmPassErr = validateConfirmPassword(
      newPassword,
      confirmPassword,
    );

    setNewPasswordError(newPassErr);
    setConfirmPasswordError(confirmPassErr);

    if (newPassErr || confirmPassErr) return;

    try {
      await resetPassword({
        email,
        resetToken: token,
        newPassword: newPassword,
      }).unwrap();

      onSuccess();
    } catch (err) {
      console.error("Reset password failed:", err);
      setApiError(
        err?.data?.message ||
          authText.resetPasswordFailed ||
          "Failed to reset password.",
      );
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-center text-[28px] font-bold text-[#990011]">
        {authText.forgotStep3Title || "Đặt mật khẩu mới"}
      </h2>

      <form onSubmit={handleResetPassword} className="mt-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* New Password */}
          <div>
            <label className="mb-1 block text-xs text-[#606060]">
              {authText.newPasswordLabel || "Mật khẩu mới"}
            </label>
            <TextInput
              variant="round"
              type="password"
              autoComplete="new-password"
              placeholder={
                authText.newPasswordPlaceholder || "Nhập mật khẩu mới"
              }
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError("");
              }}
              error={newPasswordError}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-xs text-[#606060]">
              {authText.confirmPasswordLabel || "Xác nhận mật khẩu"}
            </label>
            <TextInput
              variant="round"
              type="password"
              autoComplete="new-password"
              placeholder={
                authText.confirmPasswordPlaceholder || "Xác nhận lại mật khẩu"
              }
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              error={confirmPasswordError}
            />
          </div>
        </div>

        {apiError && (
          <p className="mb-4 rounded-lg bg-red-50 py-2 px-3 text-sm text-red-700">
            {apiError}
          </p>
        )}

        <AuthButton type="submit" disabled={isResetting}>
          {authText.resetPasswordButton || "Đặt lại mật khẩu"}
        </AuthButton>
      </form>
    </div>
  );
};

export default ResetPasswordFormStep;
