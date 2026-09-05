  import React, { useRef } from "react"
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

  const containerRef = useRef(null)

  const onEditClick = () => {
    handleEdit()
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t.profile?.personalInfo?.passwordTitle || t.profile?.personalInfo?.password || "Mật khẩu"}
          </h2>
          <PillButton
            onClick={onEditClick}
            variant="outline"
            startIcon={<Pencil size={18} />}
          >
            {t.profile?.personalInfo?.reset || "Reset"}
          </PillButton>
        </div>
        <div className="w-full h-11 rounded-xl border border-border bg-gray-50/50 text-gray-500 cursor-not-allowed px-3 flex items-center text-lg tracking-widest">
          ***********
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {t.profile?.personalInfo?.passwordTitle || t.profile?.personalInfo?.password || "Mật khẩu"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={isLoading || isSendingOtp}
          >
            {t.profile?.personalInfo?.cancel || "Hủy"}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-full bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={isLoading || isSendingOtp || isFormInvalid}
          >
            {t.profile?.personalInfo?.save || "Lưu"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <PasswordInput
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          placeholder={
            t.profile?.personalInfo?.currentPassword || "Current password"
          }
          className="!h-11 !rounded-xl bg-gray-50/50 !text-sm border-border"
        />

        <PasswordInput
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder={t.profile?.personalInfo?.newPassword || "New password"}
          isValid={isNewPasswordValid}
          invalidMessage={
            formData.newPassword && formData.newPassword === formData.currentPassword
              ? (t.profile?.personalInfo?.newPasswordSameAsCurrent || "Mật khẩu mới không được trùng với mật khẩu hiện tại")
              : (t.profile?.personalInfo?.newPasswordMinLength || "Mật khẩu mới phải có ít nhất 6 ký tự")
          }
          validMessage={
            t.profile?.personalInfo?.newPasswordLengthValid ||
            "Độ dài mật khẩu hợp lệ"
          }
          className="!h-11 !rounded-xl bg-gray-50/50 !text-sm border-border"
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
          className="!h-11 !rounded-xl bg-gray-50/50 !text-sm border-border"
        />

        {error && <p className="text-sm text-red-600 px-1">{error}</p>}
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
