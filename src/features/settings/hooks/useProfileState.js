import { useState, useEffect } from "react"
import { parsePhoneData } from "@/shared/constants/countriesOptions"

export const useProfileState = (profileData) => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    nickname: "",
    email: "",
    accountType: "Student",
    level: "HSK3",
    address: "",
    phoneNumber: "",
    phonePrefix: "+84",
    country: "",
    timeZone: "Asia/Ho_Chi_Minh",
    dateOfBirth: "",
    avatarImageUrl: "",
    meetingAvatarUrl: "",
  })

  const [editingField, setEditingField] = useState(null)
  const [errors, setErrors] = useState({})
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)

  useEffect(() => {
    if (profileData) {
      const { phonePrefix, phoneNumber } = parsePhoneData(profileData.phoneNumber)
      setFormData({
        fullName: profileData.fullName || "",
        username: profileData.username || "",
        nickname: profileData.nickname || "",
        email: profileData.email || "",
        accountType: profileData.roleName || "Student",
        level: profileData.level || "HSK3",
        address: profileData.address || "",
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        country: profileData.country || "",
        timeZone: profileData.timeZone || "Asia/Ho_Chi_Minh",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split("T")[0] : "",
        avatarImageUrl: profileData.avatarImageUrl || "",
        meetingAvatarUrl: profileData.meetingAvatarUrl || "",
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
    if (profileData) {
      const { phonePrefix, phoneNumber } = parsePhoneData(profileData.phoneNumber)
      setFormData((prev) => ({
        ...prev,
        fullName: profileData.fullName || "",
        username: profileData.username || "",
        nickname: profileData.nickname || "",
        email: profileData.email || "",
        address: profileData.address || "",
        phoneNumber: phoneNumber,
        phonePrefix: phonePrefix,
        country: profileData.country || "",
        timeZone: profileData.timeZone || "Asia/Ho_Chi_Minh",
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split("T")[0] : "",
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return {
    formData,
    setFormData,
    editingField,
    setEditingField,
    errors,
    setErrors,
    isOtpModalOpen,
    setIsOtpModalOpen,
    handleEdit,
    handleCancel,
    handleChange,
    parsePhoneData
  }
}
