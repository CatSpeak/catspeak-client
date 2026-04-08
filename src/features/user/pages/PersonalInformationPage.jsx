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
  }

  const handleCancel = () => {
    setEditingField(null)
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

  const handleSave = async () => {
    try {
      await updateProfile({
        nickname: formData.nickname,
        country: formData.country,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      }).unwrap()
      setEditingField(null)
    } catch (error) {
      console.error("Failed to update profile", error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-red-900">
        {t.profile?.personalInfo?.title}
      </h1>

      <ProfileHeader avatarImageUrl={formData.avatarImageUrl} t={t} />

      <BasicInfoSection
        formData={formData}
        editingField={editingField}
        isUpdating={isUpdating}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onChange={handleChange}
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
      />
    </div>
  )
}

export default PersonalInformationPage
