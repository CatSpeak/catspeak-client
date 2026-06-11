import { useState } from "react"
import {
  useChangePasswordMutation,
  useRequestUserProfileOtpMutation,
} from "@/store/api/userApi"

export const useChangePassword = (t) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [requestUserProfileOtp, { isLoading: isSendingOtp }] =
    useRequestUserProfileOtpMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const isNewPasswordValid = formData.newPassword ? formData.newPassword.length >= 6 : null
  const isConfirmPasswordValid = formData.confirmPassword ? formData.newPassword === formData.confirmPassword : null

  const isFormInvalid =
    !formData.currentPassword ||
    isNewPasswordValid !== true ||
    isConfirmPasswordValid !== true

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError("")
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  return {
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
    handleOtpResend
  }
}
