import { useState, useEffect } from "react"

export const useProfileState = (profileData) => {
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

  const parsePhoneData = (fullPhone) => {
    fullPhone = fullPhone || ""
    let phonePrefix = "+84"
    let phoneNumber = fullPhone
    if (fullPhone.startsWith("+84")) {
      phonePrefix = "+84"
      phoneNumber = fullPhone.slice(3)
    } else if (fullPhone.startsWith("+86")) {
      phonePrefix = "+86"
      phoneNumber = fullPhone.slice(3)
    } else if (fullPhone.startsWith("+1")) {
      phonePrefix = "+1"
      phoneNumber = fullPhone.slice(2)
    }
    return { phonePrefix, phoneNumber }
  }

  useEffect(() => {
    if (profileData?.data) {
      const { phonePrefix, phoneNumber } = parsePhoneData(profileData.data.phoneNumber)
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
      const { phonePrefix, phoneNumber } = parsePhoneData(profileData.data.phoneNumber)
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
