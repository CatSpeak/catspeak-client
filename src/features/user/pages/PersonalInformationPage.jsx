import React, { useEffect, useState } from "react"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/store/api/userApi"

import ProfileHeader from "../components/ProfileHeader"
import BasicInfoSection from "../components/BasicInfoSection"
import AccountPrivacySection from "../components/AccountPrivacySection"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"

const PersonalInformationPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { data: profileData, isLoading, error } = useGetUserProfileQuery()

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation()

  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    email: "",
    accountType: "Student",
    level: "HSK3",
    address: "",
    phoneNumber: "",
    country: "",
    avatarImageUrl: "",
  })

  const [editingField, setEditingField] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (profileData?.data) {
      setFormData({
        username: profileData.data.username || "",
        nickname: profileData.data.nickname || "",
        email: profileData.data.email || "",
        accountType: profileData.data.roleName || "Student",
        level: profileData.data.level || "HSK3",
        address: profileData.data.address || "",
        phoneNumber: profileData.data.phoneNumber || "",
        country: profileData.data.country || "",
        avatarImageUrl: profileData.data.avatarImageUrl || "",
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
      setFormData((prev) => ({
        ...prev,
        username: profileData.data.username || "",
        nickname: profileData.data.nickname || "",
        email: profileData.data.email || "",
        address: profileData.data.address || "",
        phoneNumber: profileData.data.phoneNumber || "",
        country: profileData.data.country || "",
      }))
    }
  }

  const buildProfilePayload = (overrides = {}) => ({
    nickname: formData.nickname,
    country: formData.country,
    address: formData.address,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    ...overrides,
  })

  const validatePhoneInput = (phoneNumber, country) => {
    if (!phoneNumber) return true
    const clean = phoneNumber.replace(/[\s\-\(\)]/g, "")
    if (!/^[0-9]+$/.test(clean)) return false

    const lowerCountry = (country || "").trim().toLowerCase()
    const isVN = lowerCountry === "vietnam" || lowerCountry === "vn" || lowerCountry === "việt nam"
    const isCN = lowerCountry === "china" || lowerCountry === "cn" || lowerCountry === "trung quốc"
    const isUS = lowerCountry === "united states" || lowerCountry === "usa" || lowerCountry === "us" || lowerCountry === "mỹ" || lowerCountry === "anh"

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
    setErrors({})
    const field = editingField

    if (field === "phoneNumber") {
      if (formData.phoneNumber && !validatePhoneInput(formData.phoneNumber, formData.country)) {
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

    try {
      await updateProfile(buildProfilePayload()).unwrap()
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

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="w-full flex flex-col gap-6">
      <PageTitle>{t.profile?.personalInfo?.title}</PageTitle>

      <FluentCard className="flex flex-col gap-6">
        <ProfileHeader avatarImageUrl={formData.avatarImageUrl} username={formData.username} t={t} />

        <BasicInfoSection
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating}
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
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          t={t}
          errors={errors}
        />
      </FluentCard>
    </div>
  )
}

export default PersonalInformationPage
