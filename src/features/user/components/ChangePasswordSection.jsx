import React, { useState } from "react"
import { Check, X, Eye, EyeOff } from "lucide-react"
import { useChangePasswordMutation, useRequestUserProfileOtpMutation } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import ProfileOtpModal from "./ProfileOtpModal"

const ChangePasswordSection = ({ t }) => {
  const { user } = useAuth()
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [requestUserProfileOtp, { isLoading: isSendingOtp }] = useRequestUserProfileOtpMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [showVisibility, setShowVisibility] = useState({ current: false, new: false, confirm: false })
  const [error, setError] = useState("")
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const isNewPasswordValid = formData.newPassword ? formData.newPassword.length >= 6 : null
  const isConfirmPasswordValid = formData.confirmPassword 
    ? formData.newPassword === formData.confirmPassword 
    : null

  const handleEdit = () => {
    setIsEditing(true)
    setShowVisibility({ current: false, new: false, confirm: false })
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowVisibility({ current: false, new: false, confirm: false })
    setError("")
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleSave = async () => {
    if (isSendingOtp || isLoading) return
    setError("")

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError(t.validation?.password?.allFieldsRequired || "All password fields are required")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t.validation?.password?.mismatch || "Passwords do not match")
      return
    }

    try {
      await requestUserProfileOtp().unwrap()
      setIsOtpModalOpen(true)
    } catch (err) {
      console.error("Failed to request OTP for password change", err)
      setError(err?.data?.message || err?.data?.title || "Không thể gửi OTP. Vui lòng thử lại sau.")
    }
  }

  const handleOtpVerify = async (otpValue, { setError: setModalError }) => {
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
        otpCode: otpValue,
      }).unwrap()
      setIsOtpModalOpen(false)
      handleCancel()
    } catch (err) {
      console.error("Failed to change password with OTP", err)
      const apiMessage = err?.data?.message || err?.data?.title
      if (apiMessage) {
        const lowerMsg = apiMessage.toLowerCase()
        if (lowerMsg.includes("otp") || lowerMsg.includes("mã otp")) {
          setModalError(t.profile?.personalInfo?.otpInvalid || "Mã OTP không hợp lệ hoặc đã hết hạn")
        } else if (lowerMsg.includes("current password")) {
          setModalError(t.validation?.password?.currentIncorrect || "Mật khẩu hiện tại không đúng")
        } else {
          setModalError(apiMessage)
        }
      } else {
        setModalError("Có lỗi xảy ra, vui lòng thử lại.")
      }
    }
  }

  const handleOtpResend = async () => {
    await requestUserProfileOtp().unwrap()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between border-b border-gray-100 py-3">
        <span className="w-32 font-bold text-gray-900">
          {t.profile?.personalInfo?.password || "Password"}
        </span>
        <span className="flex-1 text-gray-600 tracking-widest text-lg">
          ***********
        </span>
        <button
          onClick={handleEdit}
          className="font-bold text-red-800 hover:text-red-900"
        >
          {t.profile?.personalInfo?.reset || "Reset"}
        </button>
      </div>
    )
  }

  const isFormInvalid =
    !formData.currentPassword ||
    isNewPasswordValid !== true ||
    isConfirmPasswordValid !== true;

  return (
    <div className="border-b border-gray-100 py-3">
      <div className="flex items-center justify-between mb-4">
        <span className="w-32 font-bold text-gray-900">
          {t.profile?.personalInfo?.password || "Password"}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isLoading || isSendingOtp || isFormInvalid}
            className="font-bold text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center justify-center min-w-5 cursor-pointer"
          >
            {isSendingOtp ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
            ) : (
              <Check size={18} />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading || isSendingOtp}
            className="font-bold text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 pl-32">
        {/* Current Password */}
        <div>
          <div className="relative flex items-center">
            <input
              type={showVisibility.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder={t.profile?.personalInfo?.currentPassword || "Current password"}
              className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-red-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowVisibility(prev => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showVisibility.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <div className="relative flex items-center">
            <input
              type={showVisibility.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder={t.profile?.personalInfo?.newPassword || "New password"}
              className={`w-full rounded border px-3 py-2 pr-10 text-sm focus:outline-none ${
                isNewPasswordValid === true
                  ? "border-green-600 focus:border-green-600"
                  : isNewPasswordValid === false
                  ? "border-red-600 focus:border-red-600"
                  : "border-gray-300 focus:border-red-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowVisibility(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showVisibility.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {isNewPasswordValid === false && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <X size={12} /> {t.profile?.personalInfo?.newPasswordMinLength || "Mật khẩu mới phải có ít nhất 6 ký tự"}
            </p>
          )}
          {isNewPasswordValid === true && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Check size={12} /> {t.profile?.personalInfo?.newPasswordLengthValid || "Độ dài mật khẩu hợp lệ"}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <div className="relative flex items-center">
            <input
              type={showVisibility.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t.profile?.personalInfo?.confirmPassword || "Confirm new password"}
              className={`w-full rounded border px-3 py-2 pr-10 text-sm focus:outline-none ${
                isConfirmPasswordValid === true
                  ? "border-green-600 focus:border-green-600"
                  : isConfirmPasswordValid === false
                  ? "border-red-600 focus:border-red-600"
                  : "border-gray-300 focus:border-red-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showVisibility.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {isConfirmPasswordValid === false && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <X size={12} /> {t.profile?.personalInfo?.passwordsMismatch || "Mật khẩu xác nhận không khớp"}
            </p>
          )}
          {isConfirmPasswordValid === true && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Check size={12} /> {t.profile?.personalInfo?.passwordsMatch || "Mật khẩu xác nhận khớp"}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
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
