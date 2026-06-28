import React from "react"
import { Check, X, Pencil } from "lucide-react"
import { useAuth } from "@/features/auth"
import { useChangePassword } from "../hooks/useChangePassword"
import ProfileOtpModal from "./ProfileOtpModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PasswordInput from "@/shared/components/ui/PasswordInput"

const ChangePasswordSection = ({ t }) => {
  const { user } = useAuth()

  const {
    isEditing,
    isLoading,
    isSendingOtp,
    error,
    isOtpModalOpen,
    setIsOtpModalOpen,
    formData,
    isNewPasswordValid,
    isConfirmPasswordValid,
    isFormInvalid,
    handleEdit,
    handleCancel,
    handleChange,
    handleSave,
    handleOtpVerify,
    handleOtpResend,
  } = useChangePassword(t)

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-3">
        <span>{t.profile?.personalInfo?.password || "Password"}</span>
        <div className="w-full h-12 rounded-2xl border border-[#e2e2e2] bg-gray-50 text-gray-500 cursor-not-allowed px-4 flex items-center text-lg tracking-widest">
          ***********
        </div>
        <div className="flex justify-end gap-3 mt-1 max-[425px]:w-full">
          <PillButton
            onClick={handleEdit}
            variant="outline"
            startIcon={<Pencil size={18} />}
            className="max-[425px]:w-full"
          >
            {t.profile?.personalInfo?.reset || "Reset"}
          </PillButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <span>{t.profile?.personalInfo?.password || "Password"}</span>

      <div className="flex flex-col gap-4">
        <PasswordInput
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          placeholder={
            t.profile?.personalInfo?.currentPassword || "Current password"
          }
        />

        <PasswordInput
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder={t.profile?.personalInfo?.newPassword || "New password"}
          isValid={isNewPasswordValid}
          invalidMessage={
            t.profile?.personalInfo?.newPasswordMinLength ||
            "Mật khẩu mới phải có ít nhất 6 ký tự"
          }
          validMessage={
            t.profile?.personalInfo?.newPasswordLengthValid ||
            "Độ dài mật khẩu hợp lệ"
          }
        />

        <PasswordInput
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={
            t.profile?.personalInfo?.confirmPassword || "Confirm new password"
          }
          isValid={isConfirmPasswordValid}
          invalidMessage={
            t.profile?.personalInfo?.passwordsMismatch ||
            "Mật khẩu xác nhận không khớp"
          }
          validMessage={
            t.profile?.personalInfo?.passwordsMatch || "Mật khẩu xác nhận khớp"
          }
        />

        {error && <p className="text-sm text-red-600 px-1">{error}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-2 max-[425px]:w-full">
        <PillButton
          onClick={handleCancel}
          disabled={isLoading || isSendingOtp}
          variant="outline"
          className="max-[425px]:flex-1"
        >
          {t.profile?.personalInfo?.cancel || "Hủy"}
        </PillButton>
        <PillButton
          onClick={handleSave}
          disabled={isLoading || isSendingOtp || isFormInvalid}
          loading={isSendingOtp}
          variant="primary"
          bgColor="#16a34a"
          className="max-[425px]:flex-1"
        >
          {t.profile?.personalInfo?.save || "Lưu"}
        </PillButton>
      </div>

      <ProfileOtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={user?.email}
        onVerify={handleOtpVerify}
        isVerifying={isLoading}
        onResend={handleOtpResend}
        isResending={isSendingOtp}
        t={t}
      />
    </div>
  )
}

export default ChangePasswordSection
