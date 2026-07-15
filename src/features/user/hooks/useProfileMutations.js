import { toast } from "react-hot-toast"
import {
  useUpdateUserProfileMutation,
  useRequestUserProfileOtpMutation,
  useUpdateMeetingAvatarMutation,
  useRequestPhoneUpdateOtpMutation,
  useUpdatePhoneNumberMutation,
  useUpdateAvatarMutation,
} from "@/store/api/userApi"
import { validatePhoneInput, buildProfilePayload } from "../utils/profileValidation"

export const useProfileMutations = (t, profileData, stateHooks) => {
  const {
    formData,
    setFormData,
    editingField,
    setEditingField,
    setErrors,
    setIsOtpModalOpen,
    parsePhoneData
  } = stateHooks

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation()
  const [updateMeetingAvatar] = useUpdateMeetingAvatarMutation()
  const [updateAvatar] = useUpdateAvatarMutation()
  const [requestUserProfileOtp, { isLoading: isSendingOtp }] = useRequestUserProfileOtpMutation()
  const [requestPhoneUpdateOtp, { isLoading: isSendingPhoneOtp }] = useRequestPhoneUpdateOtpMutation()
  const [updatePhoneNumber, { isLoading: isUpdatingPhone }] = useUpdatePhoneNumberMutation()

  const isUpdating = isUpdatingProfile || isSendingOtp || isSendingPhoneOtp

  const handleSave = async () => {
    if (isUpdating) return
    setErrors({})
    const field = editingField

    if (field === "phoneNumber") {
      if (formData.phoneNumber && !validatePhoneInput(formData.phoneNumber, formData.phonePrefix)) {
        setErrors({ phoneNumber: t.auth?.validationPhoneInvalid || "Số điện thoại không đúng định dạng" })
        return
      }
    }

    if (field === "email") {
      if (!formData.email) {
        setErrors({ email: t.auth?.validationEmailRequired || "Vui lòng nhập email!" })
        return
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors({ email: t.auth?.validationEmailInvalid || "Vui lòng nhập email hợp lệ!" })
        return
      }
    }

    // Determine if sensitive fields are modified
    let isSensitiveChange = false
    if (field === "email") {
      const origEmail = (profileData?.email || "").toLowerCase()
      const newEmail = (formData.email || "").toLowerCase()
      if (origEmail !== newEmail) {
        isSensitiveChange = true
      }
    } else if (field === "phoneNumber") {
      const { phoneNumber: strippedOrigPhone } = parsePhoneData(profileData?.phoneNumber)
      const cleanPhone = formData.phoneNumber || ""
      if (strippedOrigPhone !== cleanPhone) {
        isSensitiveChange = true
      }
    }

    if (isSensitiveChange) {
      try {
        if (field === "phoneNumber") {
          const fullPhone = `${formData.phonePrefix || "+84"}${formData.phoneNumber}`
          await requestPhoneUpdateOtp({ newPhoneNumber: fullPhone }).unwrap()
        } else {
          await requestUserProfileOtp().unwrap()
        }
        setIsOtpModalOpen(true)
      } catch (err) {
        console.error("Failed to request OTP for profile update", err)
        const apiMessage = err?.data?.message || err?.data?.title || ""
        const errCode = err?.data?.errorCode || ""

        if (errCode === "RATE_LIMIT_EXCEEDED" || apiMessage.includes("RATE_LIMIT_EXCEEDED")) {
          setErrors({
            [field]: t.profile?.personalInfo?.phoneRateLimit || "Bạn chỉ có thể thay đổi số điện thoại 1 lần trong vòng 30 ngày.",
          })
          toast.error(t.profile?.personalInfo?.phoneRateLimit || "Bạn chỉ có thể thay đổi số điện thoại 1 lần trong vòng 30 ngày.")
        } else {
          setErrors({ [field]: apiMessage || "Không thể gửi OTP. Vui lòng thử lại sau." })
        }
      }
    } else {
      // Non-sensitive update, or sensitive field didn't change
      try {
        await updateProfile(buildProfilePayload(editingField, formData)).unwrap()
        toast.success(t.profile?.personalInfo?.profileUpdateSuccess || "Cập nhật thông tin thành công!")
        setEditingField(null)
      } catch (err) {
        console.error("Failed to update profile", err)
        const apiMessage = err?.data?.message || err?.data?.title
        if (apiMessage) {
          const lowerMsg = apiMessage.toLowerCase()
          if (lowerMsg.includes("email") && lowerMsg.includes("already exists")) {
            setErrors({ email: t.auth?.emailExists || "Email đã tồn tại" })
          } else if (lowerMsg.includes("phone") && lowerMsg.includes("already exists")) {
            setErrors({ phoneNumber: t.auth?.phoneExists || "Số điện thoại đã tồn tại" })
          } else if (lowerMsg.includes("phone") && (lowerMsg.includes("invalid") || lowerMsg.includes("hợp lệ"))) {
            setErrors({ phoneNumber: t.auth?.validationPhoneInvalid || "Số điện thoại không đúng định dạng" })
          } else {
            setErrors({ [field]: apiMessage })
          }
        }
      }
    }
  }

  const handleOtpVerify = async (otpValue, { setError: setModalError }) => {
    try {
      if (editingField === "phoneNumber") {
        const fullPhone = `${formData.phonePrefix || "+84"}${formData.phoneNumber}`
        await updatePhoneNumber({
          otpCode: otpValue,
          newPhoneNumber: fullPhone,
        }).unwrap()
        toast.success(t.profile?.personalInfo?.phoneUpdateSuccess || "Cập nhật số điện thoại thành công!")
      } else {
        await updateProfile(buildProfilePayload(editingField, formData, { OtpCode: otpValue })).unwrap()
        toast.success(t.profile?.personalInfo?.profileUpdateSuccess || "Cập nhật thông tin thành công!")
      }
      setIsOtpModalOpen(false)
      setEditingField(null)
    } catch (err) {
      console.error("Failed to update profile with OTP", err)
      const apiMessage = err?.data?.message || err?.data?.title
      if (apiMessage) {
        const lowerMsg = apiMessage.toLowerCase()
        if (lowerMsg.includes("otp") || lowerMsg.includes("mã otp")) {
          setModalError(t.profile?.personalInfo?.otpInvalid || "Mã OTP không hợp lệ hoặc đã hết hạn")
        } else if (lowerMsg.includes("email") && lowerMsg.includes("already exists")) {
          setModalError(t.auth?.emailExists || "Email đã tồn tại")
        } else if (lowerMsg.includes("phone") && lowerMsg.includes("already exists")) {
          setModalError(t.auth?.phoneExists || "Số điện thoại đã tồn tại")
        } else {
          setModalError(apiMessage)
        }
      } else {
        setModalError("Có lỗi xảy ra, vui lòng thử lại.")
      }
    }
  }

  const handleOtpResend = async () => {
    if (editingField === "phoneNumber") {
      const fullPhone = `${formData.phonePrefix || "+84"}${formData.phoneNumber}`
      await requestPhoneUpdateOtp({ newPhoneNumber: fullPhone }).unwrap()
    } else {
      await requestUserProfileOtp().unwrap()
    }
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
      const formData = new FormData()
      formData.append("file", file)
      await updateAvatar(formData).unwrap()
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
    handleUpdateAvatarFile
  }
}
