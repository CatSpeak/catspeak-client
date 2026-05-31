import React, { useEffect, useState } from "react"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateMeetingAvatarMutation,
} from "@/store/api/userApi"
import { toast } from "react-hot-toast"

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
  const [updateMeetingAvatar] = useUpdateMeetingAvatarMutation()

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
    meetingAvatarUrl: "",
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
        meetingAvatarUrl: profileData.data.meetingAvatarUrl || "",
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

  const buildProfilePayload = (overrides = {}) => ({
    nickname: formData.nickname,
    country: formData.country,
    address: formData.address,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    ...overrides,
  })

  const handleSave = async () => {
    try {
      await updateProfile(buildProfilePayload()).unwrap()
      setEditingField(null)
    } catch (error) {
      console.error("Failed to update profile", error)
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

  const handleUpdateAvatarUrl = async (url) => {
    try {
      await updateMeetingAvatar({ meetingAvatarUrl: url }).unwrap()
      toast.success(t?.profile?.personalInfo?.avatarUpdated || "Avatar updated successfully")
    } catch (err) {
      console.error("Failed to update avatar", err)
      toast.error(t?.profile?.personalInfo?.avatarUpdateFailed || "Failed to update avatar")
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
        />
      </FluentCard>
    </div>
  )
}

export default PersonalInformationPage
