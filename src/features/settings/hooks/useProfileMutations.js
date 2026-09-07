import { toast } from "react-hot-toast"
import {
  useUpdateUserProfileMutation,
  useRequestUserProfileOtpMutation,
  useUpdateAvatarMutation,
  useUpdateSecurityProfileMutation,
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

export const useProfileMutations = (t, profileData, stateHooks, identityState) => {
  const {
    formData,
    setFormData,
    editingField,
    setEditingField,
    setErrors,
    setIsOtpModalOpen,
    parsePhoneData,
  } = stateHooks
  const { idFiles, resetIdFiles } = identityState || {}

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation()
  const [updateAvatar] = useUpdateAvatarMutation()
  const [requestUserProfileOtp, { isLoading: isSendingOtp }] = useRequestUserProfileOtpMutation()
  const [updateSecurity, { isLoading: isSavingSecurity }] = useUpdateSecurityProfileMutation()

  const isUpdating = isUpdatingProfile || isSendingOtp || isSavingSecurity

  // Client-side validation for the unified security card (email + phone)
  const validateSecurityInput = () => {
    const errs = {}
    if (!formData.email) {
      errs.email = t.auth?.validationEmailRequired || "Vui lòng nhập email!"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = t.auth?.validationEmailInvalid || "Vui lòng nhập email hợp lệ!"
    }
    if (formData.phoneNumber && !validatePhoneInput(formData.phoneNumber, formData.phonePrefix)) {
      errs.phoneNumber = t.auth?.validationPhoneInvalid || "Số điện thoại không đúng định dạng"
    }
    return Object.keys(errs).length > 0 ? errs : null
  }

  // True when Email/Phone/ID differs from the saved profile
  const isSecurityChanged = () => {
    const origEmail = (profileData?.email || "").toLowerCase()
    if ((formData.email || "").toLowerCase() !== origEmail) return true
    const orig = parsePhoneData(profileData?.phoneNumber)
    if (formData.phoneNumber !== orig.phoneNumber || formData.phonePrefix !== orig.phonePrefix) return true
    if (idFiles?.front instanceof File || idFiles?.back instanceof File) return true
    return false
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

    // Security card: one Save for Email + Phone + ID with a single OTP.
    if (editingField === "securityInfo") {
      const securityErrors = validateSecurityInput()
      if (securityErrors) {
        setErrors(securityErrors)
        return
      }
      if (!isSecurityChanged()) {
        setEditingField(null)
        resetIdFiles?.()
        return
      }
      try {
        await requestUserProfileOtp({}).unwrap()
        setIsOtpModalOpen(true)
      } catch (err) {
        console.error("Failed to request OTP for security update", err)
        toast.error(err?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.")
      }
      return
    }

    const validationError = validateFieldInput(editingField, formData, t)
    if (validationError) {
      setErrors(validationError)
      return
    }

    await handleDirectProfileSave()
  }

  const handleOtpVerify = async (otpValue, { setError: setModalError }) => {
    try {
      const fd = new FormData()
      fd.append("Email", formData.email || "")
      fd.append("PhoneNumber", formData.phoneNumber || "")
      if (idFiles?.front instanceof File) fd.append("IdCardFront", idFiles.front)
      if (idFiles?.back instanceof File) fd.append("IdCardBack", idFiles.back)
      fd.append("OtpCode", otpValue)
      await updateSecurity(fd).unwrap()
      toast.success(t.profile?.personalInfo?.accountUpdateSuccess || "Cập nhật thông tin tài khoản thành công!")
      setIsOtpModalOpen(false)
      setEditingField(null)
      resetIdFiles?.()
    } catch (err) {
      console.error("Failed to update security info with OTP", err)
      const apiMessage = err?.data?.message || err?.data?.title || ""
      const lowerMsg = apiMessage.toLowerCase()

      if (lowerMsg.includes("otp") || lowerMsg.includes("mã otp")) {
        setModalError(t.profile?.personalInfo?.otpInvalid || "Mã OTP không hợp lệ hoặc đã hết hạn")
      } else {
        const { field: errField } = parseProfileApiError(err, t, editingField)
        setErrors((prev) => ({ ...prev, [errField]: apiMessage || "Có lỗi xảy ra, vui lòng thử lại." }))
        setModalError(apiMessage || "Có lỗi xảy ra, vui lòng thử lại.")
      }
    }
  }

  const handleOtpResend = async () => {
    await requestUserProfileOtp({}).unwrap()
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
    isSendingOtp,
    isSavingSecurity,
    handleSave,
    handleOtpVerify,
    handleOtpResend,
    handleCountryChange,
    handleUpdateAvatarFile,
  }
}
