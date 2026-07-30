import { toast } from "react-hot-toast"
import {
  useUpdateUserProfileMutation,
  useRequestUserProfileOtpMutation,
  useUpdateMeetingAvatarMutation,
  useRequestPhoneUpdateOtpMutation,
  useUpdatePhoneNumberMutation,
  useUpdateAvatarMutation,
} from "@/store/api/userApi"
import { buildProfilePayload, validatePhoneInput } from "../utils/profileValidation"

/**
 * Maps API error responses to localized error messages and target form fields.
 */
const parseProfileApiError = (err, t, fallbackField) => {
  const apiMessage = err?.data?.message || err?.data?.title || ""
  const errCode = err?.data?.errorCode || ""
  const lowerMsg = apiMessage.toLowerCase()

  if (errCode === "RATE_LIMIT_EXCEEDED" || lowerMsg.includes("rate_limit_exceeded")) {
    return {
      field: fallbackField,
      message: t.profile?.personalInfo?.phoneRateLimit || "Bạn chỉ có thể thực hiện 1 lần trong khoảng thời gian cho phép.",
    }
  }

  if (lowerMsg.includes("username")) {
    return { field: "username", message: t.auth?.usernameExists || apiMessage }
  }

  if (lowerMsg.includes("email") || errCode === "EMAIL_ALREADY_EXISTS") {
    return {
      field: "email",
      message: apiMessage || t.auth?.emailExists || "Email này đã được sử dụng bởi một tài khoản khác",
    }
  }

  if (lowerMsg.includes("phone") && (lowerMsg.includes("already exists") || lowerMsg.includes("sử dụng") || errCode === "PHONE_ALREADY_EXISTS")) {
    return {
      field: "phoneNumber",
      message: apiMessage || t.auth?.phoneExists || "Số điện thoại này đã được sử dụng bởi một tài khoản khác",
    }
  }

  if (lowerMsg.includes("phone") && (lowerMsg.includes("invalid") || lowerMsg.includes("hợp lệ"))) {
    return {
      field: "phoneNumber",
      message: t.auth?.validationPhoneInvalid || apiMessage,
    }
  }

  return {
    field: fallbackField,
    message: apiMessage || "Không thể cập nhật thông tin. Vui lòng thử lại sau.",
  }
}

/**
 * Validates field inputs before triggering API requests.
 */
const validateFieldInput = (field, formData, t) => {
  if (field === "phoneNumber" && formData.phoneNumber) {
    if (!validatePhoneInput(formData.phoneNumber, formData.phonePrefix)) {
      return { phoneNumber: t.auth?.validationPhoneInvalid || "Số điện thoại không đúng định dạng" }
    }
  }

  if (field === "email") {
    if (!formData.email) {
      return { email: t.auth?.validationEmailRequired || "Vui lòng nhập email!" }
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return { email: t.auth?.validationEmailInvalid || "Vui lòng nhập email hợp lệ!" }
    }
  }

  return null
}

export const useProfileMutations = (t, profileData, stateHooks) => {
  const {
    formData,
    setFormData,
    editingField,
    setEditingField,
    setErrors,
    setIsOtpModalOpen,
  } = stateHooks

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation()
  const [updateMeetingAvatar] = useUpdateMeetingAvatarMutation()
  const [updateAvatar] = useUpdateAvatarMutation()
  const [requestUserProfileOtp, { isLoading: isSendingOtp }] = useRequestUserProfileOtpMutation()
  const [requestPhoneUpdateOtp, { isLoading: isSendingPhoneOtp }] = useRequestPhoneUpdateOtpMutation()
  const [updatePhoneNumber, { isLoading: isUpdatingPhone }] = useUpdatePhoneNumberMutation()

  const isUpdating = isUpdatingProfile || isSendingOtp || isSendingPhoneOtp

  // Handles Email update requiring OTP verification
  const handleEmailSaveWithOtp = async () => {
    try {
      await requestUserProfileOtp({ newEmail: formData.email }).unwrap()
      setIsOtpModalOpen(true)
    } catch (err) {
      console.error("Failed to request OTP for email update", err)
      const { field: errField, message } = parseProfileApiError(err, t, editingField)
      setErrors((prev) => ({ ...prev, [errField]: message }))
      toast.error(message)
    }
  }

  // Handles direct update for non-email fields (Username, Nickname, Phone, Address, etc.)
  const handleDirectProfileSave = async () => {
    try {
      await updateProfile(buildProfilePayload(editingField, formData)).unwrap()
      toast.success(t.profile?.personalInfo?.accountUpdateSuccess || "Cập nhật thông tin tài khoản thành công!")
      setEditingField(null)
    } catch (err) {
      console.error("Failed to update profile", err)
      const { field: errField, message } = parseProfileApiError(err, t, editingField)
      setErrors((prev) => ({ ...prev, [errField]: message }))
      toast.error(message)
    }
  }

  const handleSave = async () => {
    if (isUpdating) return
    setErrors({})

    const validationError = validateFieldInput(editingField, formData, t)
    if (validationError) {
      setErrors(validationError)
      return
    }

    const origEmail = (profileData?.email || "").toLowerCase()
    const newEmail = (formData.email || "").toLowerCase()
    const isEmailChanged = (editingField === "email" || editingField === "securityInfo") && origEmail !== newEmail

    if (isEmailChanged) {
      await handleEmailSaveWithOtp()
    } else {
      await handleDirectProfileSave()
    }
  }

  const handleOtpVerify = async (otpValue, { setError: setModalError }) => {
    try {
      await updateProfile(buildProfilePayload(editingField, formData, { OtpCode: otpValue })).unwrap()
      toast.success(t.profile?.personalInfo?.accountUpdateSuccess || "Cập nhật thông tin tài khoản thành công!")
      setIsOtpModalOpen(false)
      setEditingField(null)
    } catch (err) {
      console.error("Failed to update profile with OTP", err)
      const apiMessage = err?.data?.message || err?.data?.title || ""
      const lowerMsg = apiMessage.toLowerCase()

      if (lowerMsg.includes("otp") || lowerMsg.includes("mã otp")) {
        setModalError(t.profile?.personalInfo?.otpInvalid || "Mã OTP không hợp lệ hoặc đã hết hạn")
      } else if (lowerMsg.includes("email")) {
        setModalError(apiMessage || t.auth?.emailExists || "Email này đã được sử dụng bởi một tài khoản khác")
      } else {
        setModalError(apiMessage || "Có lỗi xảy ra, vui lòng thử lại.")
      }
    }
  }

  const handleOtpResend = async () => {
    await requestUserProfileOtp({ newEmail: formData.email }).unwrap()
  }

  const handleCountryChange = async (val) => {
    setFormData((prev) => ({ ...prev, country: val }))
    try {
      await updateProfile(buildProfilePayload("country", { ...formData, country: val })).unwrap()
    } catch (error) {
      console.error("Failed to update country", error)
    }
  }

  const handleUpdateAvatarFile = async (file) => {
    try {
      const data = new FormData()
      data.append("file", file)
      await updateAvatar(data).unwrap()
      toast.success(t?.profile?.personalInfo?.avatarUpdated || "Avatar updated successfully")
    } catch (err) {
      console.error("Failed to update avatar", err)
      toast.error(t?.profile?.personalInfo?.avatarUpdateFailed || "Failed to update avatar")
    }
  }

  return {
    isUpdating,
    isUpdatingPhone,
    isSendingOtp,
    isSendingPhoneOtp,
    handleSave,
    handleOtpVerify,
    handleOtpResend,
    handleCountryChange,
    handleUpdateAvatarFile,
  }
}
