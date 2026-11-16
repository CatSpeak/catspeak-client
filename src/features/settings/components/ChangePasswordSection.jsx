import React, { useRef } from "react"
import { Pencil } from "lucide-react"
import { useAuth } from "@/features/auth"
import { useChangePassword } from "../hooks/useChangePassword"
import ProfileOtpModal from "./ProfileOtpModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import PasswordInput from "@/shared/components/ui/PasswordInput"
import FluentCard from "@/shared/components/ui/FluentCard"
import Label from "@/shared/components/ui/Label"

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
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 100)
  }

  return (
    <div ref={containerRef}>
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
        {t.profile?.personalInfo?.passwordTitle ||
          t.profile?.personalInfo?.password ||
          "Mật khẩu"}
      </h2>

      <FluentCard className="flex flex-col w-full p-4 gap-4 border-border rounded-xl !justify-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            {!isEditing ? (
              <PillButton
                onClick={onEditClick}
                variant="outline"
                startIcon={<Pencil size={18} />}
              >
                {t.profile?.personalInfo?.edit || "Sửa"}
              </PillButton>
            ) : (
              <div className="flex items-center gap-2">
                <PillButton
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={isLoading || isSendingOtp}
                >
                  {t.profile?.personalInfo?.cancel || "Hủy"}
                </PillButton>

                <PillButton
                  onClick={handleSave}
                  variant="primary"
                  disabled={isLoading || isSendingOtp || isFormInvalid}
                  loading={isLoading}
                  loadingText={t.profile?.personalInfo?.saving || "Đang lưu..."}
                >
                  {t.profile?.personalInfo?.save || "Lưu"}
                </PillButton>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="flex flex-col gap-1">
              <Label>{t.profile?.personalInfo?.password || "Mật khẩu"}</Label>
              <div className="w-full h-14 rounded border border-border dark:border-[#3F3F3F] bg-gray-50/50 dark:bg-[#242424] text-gray-500 dark:text-neutral-400 cursor-not-allowed px-4 flex items-center text-lg tracking-widest">
                ••••••••••••
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label>
                  {t.profile?.personalInfo?.currentPassword ||
                    "Mật khẩu hiện tại"}
                </Label>
                <PasswordInput
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder={
                    t.profile?.personalInfo?.enterCurrentPassword ||
                    t.profile?.personalInfo?.currentPassword ||
                    "Nhập mật khẩu hiện tại..."
                  }
                  className="!rounded !h-14 bg-gray-50/50 dark:bg-[#242424] border-border dark:border-[#3F3F3F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>
                    {t.profile?.personalInfo?.newPassword || "Mật khẩu mới"}
                  </Label>
                  <PasswordInput
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder={
                      t.profile?.personalInfo?.enterNewPassword ||
                      t.profile?.personalInfo?.newPassword ||
                      "Nhập mật khẩu mới..."
                    }
                    isValid={isNewPasswordValid}
                    invalidMessage={
                      formData.newPassword &&
                      formData.newPassword === formData.currentPassword
                        ? t.profile?.personalInfo?.newPasswordSameAsCurrent ||
                          "Mật khẩu mới không được trùng với mật khẩu hiện tại"
                        : t.profile?.personalInfo?.newPasswordMinLength ||
                          "Mật khẩu mới phải có ít nhất 6 ký tự"
                    }
                    validMessage={
                      t.profile?.personalInfo?.newPasswordLengthValid ||
                      "Độ dài mật khẩu hợp lệ"
                    }
                    className="!rounded !h-14 bg-gray-50/50 dark:bg-[#242424] border-border dark:border-[#3F3F3F]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    {t.profile?.personalInfo?.confirmPassword ||
                      "Xác nhận mật khẩu mới"}
                  </Label>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={
                      t.profile?.personalInfo?.enterConfirmPassword ||
                      t.profile?.personalInfo?.confirmPassword ||
                      "Nhập lại mật khẩu mới..."
                    }
                    isValid={isConfirmPasswordValid}
                    invalidMessage={
                      t.profile?.personalInfo?.passwordsMismatch ||
                      "Mật khẩu xác nhận không khớp"
                    }
                    validMessage={
                      t.profile?.personalInfo?.passwordsMatch ||
                      "Mật khẩu xác nhận khớp"
                    }
                    className="!rounded !h-14 bg-gray-50/50 dark:bg-[#242424] border-border dark:border-[#3F3F3F]"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 px-1">{error}</p>}
            </div>
          )}
        </div>
      </FluentCard>

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
