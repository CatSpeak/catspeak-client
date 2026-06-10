import React, { useEffect, useState } from "react"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useRequestUserProfileOtpMutation,
  useUpdateMeetingAvatarMutation,
} from "@/store/api/userApi"
import { toast } from "react-hot-toast"

import ProfileHeader from "../components/ProfileHeader"
import BasicInfoSection from "../components/BasicInfoSection"
import AccountPrivacySection from "../components/AccountPrivacySection"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import ProfileOtpModal from "../components/ProfileOtpModal"
import { countries } from "@/shared/constants/countriesData"

const PersonalInformationPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { data: profileData, isLoading, error } = useGetUserProfileQuery()

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation()
  const [updateMeetingAvatar] = useUpdateMeetingAvatarMutation()

  const [requestUserProfileOtp, { isLoading: isSendingOtp }] =
    useRequestUserProfileOtpMutation()

  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    email: "",
    accountType: "Student",
    level: "HSK3",
    address: "",
    phoneNumber: "",
    phonePrefix: "+84",
    country: "",
    avatarImageUrl: "",
    meetingAvatarUrl: "",
  })

  const [editingField, setEditingField] = useState(null)
  const [errors, setErrors] = useState({})
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)

  useEffect(() => {
    if (profileData?.data) {
      const fullPhone = profileData.data.phoneNumber || ""
      let phonePrefix = "+84"
      let phoneNumber = fullPhone

      if (fullPhone.startsWith("+")) {
        // Sort dialCodes by length descending to match longest prefix first (e.g. +35818 before +358)
        const sortedCountries = [...countries]
          .filter((c) => c.dialCode)
          .sort((a, b) => b.dialCode.length - a.dialCode.length)

        const matchedCountry = sortedCountries.find((c) => fullPhone.startsWith(c.dialCode))
        if (matchedCountry) {
          phonePrefix = matchedCountry.dialCode
          phoneNumber = fullPhone.slice(phonePrefix.length)
        }
      }
      setFormData({
        username: profileData.data.username || "",
        nickname: profileData.data.nickname || "",
        email: profileData.data.email || "",
        accountType: profileData.data.roleName || "Student",
        level: profileData.data.level || "HSK3",
        address: profileData.data.address || "",
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        country: profileData.data.country || "",
        avatarImageUrl: profileData.data.avatarImageUrl || "",
        meetingAvatarUrl: profileData.data.meetingAvatarUrl || "",
      })
    }
  }, [profileData])

  const handleEdit = (field) => {
    setEditingField(field)
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleCancel = () => {
    setEditingField(null)
    setErrors({})
    if (profileData?.data) {
      const fullPhone = profileData.data.phoneNumber || ""
      let phonePrefix = "+84"
      let phoneNumber = fullPhone
      if (fullPhone.startsWith("+")) {
        const sortedCountries = [...countries]
          .filter((c) => c.dialCode)
          .sort((a, b) => b.dialCode.length - a.dialCode.length)

        const matchedCountry = sortedCountries.find((c) => fullPhone.startsWith(c.dialCode))
        if (matchedCountry) {
          phonePrefix = matchedCountry.dialCode
          phoneNumber = fullPhone.slice(phonePrefix.length)
        }
      }
      setFormData((prev) => ({
        ...prev,
        username: profileData.data.username || "",
        nickname: profileData.data.nickname || "",
        email: profileData.data.email || "",
        address: profileData.data.address || "",
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        country: profileData.data.country || "",
      }))
    }
  }

  const buildProfilePayload = (overrides = {}) => {
    const prefix = overrides.phonePrefix || formData.phonePrefix || "+84"
    const phone =
      overrides.phoneNumber !== undefined
        ? overrides.phoneNumber
        : formData.phoneNumber
    const cleanPhone = phone ? `${prefix}${phone}` : ""
    return {
      nickname: formData.nickname,
      country: formData.country,
      address: formData.address,
      phoneNumber: cleanPhone,
      email: formData.email,
      ...overrides,
    }
  }

  const validatePhoneInput = (phoneNumber, country) => {
    if (!phoneNumber) return true
    const clean = phoneNumber.replace(/[\s\-\(\)]/g, "")
    if (!/^\+?[0-9]+$/.test(clean)) return false

    const lowerCountry = (country || "").trim().toLowerCase()
    const isVN =
      lowerCountry === "vietnam" ||
      lowerCountry === "vn" ||
      lowerCountry === "việt nam"
    const isCN =
      lowerCountry === "china" ||
      lowerCountry === "cn" ||
      lowerCountry === "trung quốc"
    const isUS =
      lowerCountry === "united states" ||
      lowerCountry === "usa" ||
      lowerCountry === "us" ||
      lowerCountry === "mỹ" ||
      lowerCountry === "anh"

    if (isVN) {
      return /^(0?[35789]\d{8}|\+?84[35789]\d{8})$/.test(clean)
    }
    if (isCN) {
      return /^(1[3-9]\d{9}|\+?861[3-9]\d{9})$/.test(clean)
    }
    if (isUS) {
      return /^([2-9]\d{9}|\+?1[2-9]\d{9})$/.test(clean)
    }
    return clean.length >= 7 && clean.length <= 15
  }

  const handleSave = async () => {
    if (isUpdating || isSendingOtp) return
    setErrors({})
    const field = editingField

    if (field === "phoneNumber") {
      const prefix = formData.phonePrefix || "+84"
      const combinedPhone = formData.phoneNumber
        ? `${prefix}${formData.phoneNumber}`
        : ""
      if (
        formData.phoneNumber &&
        !validatePhoneInput(combinedPhone, formData.country)
      ) {
        setErrors({
          phoneNumber:
            t.auth?.validationPhoneInvalid ||
            "Số điện thoại không đúng định dạng",
        })
        return
      }
    }

    if (field === "email") {
      if (!formData.email) {
        setErrors({
          email: t.auth?.validationEmailRequired || "Vui lòng nhập email!",
        })
        return
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors({
          email:
            t.auth?.validationEmailInvalid || "Vui lòng nhập email hợp lệ!",
        })
        return
      }
    }

    // Determine if sensitive fields are modified
    let isSensitiveChange = false
    if (field === "email") {
      const origEmail = (profileData?.data?.email || "").toLowerCase()
      const newEmail = (formData.email || "").toLowerCase()
      if (origEmail !== newEmail) {
        isSensitiveChange = true
      }
    } else if (field === "phoneNumber") {
      const origPhone = profileData?.data?.phoneNumber || ""
      const prefix = formData.phonePrefix || "+84"
      const cleanPhone = formData.phoneNumber
        ? `${prefix}${formData.phoneNumber}`
        : ""
      if (origPhone !== cleanPhone) {
        isSensitiveChange = true
      }
    }

    if (isSensitiveChange) {
      try {
        await requestUserProfileOtp().unwrap()
        setIsOtpModalOpen(true)
      } catch (err) {
        console.error("Failed to request OTP for profile update", err)
        const apiMessage =
          err?.data?.message ||
          err?.data?.title ||
          "Không thể gửi OTP. Vui lòng thử lại sau."
        setErrors({ [field]: apiMessage })
      }
    } else {
      // Non-sensitive update, or sensitive field didn't change
      try {
        await updateProfile(buildProfilePayload()).unwrap()
        setEditingField(null)
      } catch (err) {
        console.error("Failed to update profile", err)
        const apiMessage = err?.data?.message || err?.data?.title
        if (apiMessage) {
          const lowerMsg = apiMessage.toLowerCase()
          if (
            lowerMsg.includes("email") &&
            lowerMsg.includes("already exists")
          ) {
            setErrors({ email: t.auth?.emailExists || "Email đã tồn tại" })
          } else if (
            lowerMsg.includes("phone") &&
            lowerMsg.includes("already exists")
          ) {
            setErrors({
              phoneNumber: t.auth?.phoneExists || "Số điện thoại đã tồn tại",
            })
          } else if (
            lowerMsg.includes("phone") &&
            (lowerMsg.includes("invalid") || lowerMsg.includes("hợp lệ"))
          ) {
            setErrors({
              phoneNumber:
                t.auth?.validationPhoneInvalid ||
                "Số điện thoại không đúng định dạng",
            })
          } else {
            setErrors({ [field]: apiMessage })
          }
        }
      }
    }
  }

  const handleOtpVerify = async (otpValue, { setError: setModalError }) => {
    try {
      await updateProfile(buildProfilePayload({ OtpCode: otpValue })).unwrap()
      setIsOtpModalOpen(false)
      setEditingField(null)
    } catch (err) {
      console.error("Failed to update profile with OTP", err)
      const apiMessage = err?.data?.message || err?.data?.title
      if (apiMessage) {
        const lowerMsg = apiMessage.toLowerCase()
        if (lowerMsg.includes("otp") || lowerMsg.includes("mã otp")) {
          setModalError(
            t.profile?.personalInfo?.otpInvalid ||
              "Mã OTP không hợp lệ hoặc đã hết hạn",
          )
        } else if (
          lowerMsg.includes("email") &&
          lowerMsg.includes("already exists")
        ) {
          setModalError(t.auth?.emailExists || "Email đã tồn tại")
        } else if (
          lowerMsg.includes("phone") &&
          lowerMsg.includes("already exists")
        ) {
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
    await requestUserProfileOtp().unwrap()
  }

  const handleCountryChange = async (val) => {
    setFormData((prev) => ({ ...prev, country: val }))
    try {
      await updateProfile(buildProfilePayload({ country: val })).unwrap()
    } catch (error) {
      console.error("Failed to update country", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateAvatarUrl = async (url) => {
    try {
      await updateMeetingAvatar({ meetingAvatarUrl: url }).unwrap()
      toast.success(
        t?.profile?.personalInfo?.avatarUpdated ||
          "Avatar updated successfully",
      )
    } catch (err) {
      console.error("Failed to update avatar", err)
      toast.error(
        t?.profile?.personalInfo?.avatarUpdateFailed ||
          "Failed to update avatar",
      )
    }
  }

  if (isLoading) return <div>Loading...</div>

  // Use meetingAvatarUrl if available, otherwise fallback to avatarImageUrl
  const displayAvatarUrl = formData.meetingAvatarUrl || formData.avatarImageUrl

  return (
    <div className="w-full flex flex-col gap-6">
      <PageTitle>{t.profile?.personalInfo?.title}</PageTitle>

      <FluentCard className="flex flex-col gap-6">
        <ProfileHeader
          avatarImageUrl={displayAvatarUrl}
          onUpdateAvatarUrl={handleUpdateAvatarUrl}
          username={formData.username}
          t={t}
        />

        <BasicInfoSection
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating || isSendingOtp}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          onCountryChange={handleCountryChange}
          t={t}
        />

        <AccountPrivacySection
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating || isSendingOtp}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          t={t}
          errors={errors}
        />
      </FluentCard>

      <ProfileOtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={profileData?.data?.email}
        onVerify={handleOtpVerify}
        isVerifying={isUpdating}
        onResend={handleOtpResend}
        isResending={isSendingOtp}
        t={t}
      />
    </div>
  )
}

export default PersonalInformationPage
