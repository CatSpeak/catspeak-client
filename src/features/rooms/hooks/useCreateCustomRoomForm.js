import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetMyCustomRoomsQuery,
  useCreateAdvancedRoomMutation,
} from "@/store/api/roomsApi"

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh":
      return "Chinese"
    case "vi":
      return "Vietnamese"
    case "en":
      return "English"
    default:
      return "English"
  }
}

export const useCreateCustomRoomForm = (open = true) => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
    maxParticipants: 10,
    description: "",
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const { data: customRoomsData } = useGetMyCustomRoomsQuery(undefined, {
    skip: !open,
  })
  const [createAdvancedRoom, { isLoading: isCreating }] =
    useCreateAdvancedRoomMutation()

  const isQuotaFull = customRoomsData?.canCreateCustomRoom === false

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      topics: [],
      selectedLevel: "",
      isPrivate: false,
      password: "",
      maxParticipants: 10,
      description: "",
    })
    setThumbnailFile(null)
    setNameError("")
    setPasswordError("")
  }, [])

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "name" && value.trim()) {
      setNameError("")
    }
    if (field === "password" && value.trim()) {
      setPasswordError("")
    }
    if (field === "isPrivate" && !value) {
      setPasswordError("")
    }
  }

  const handleTopicChange = (e) => {
    const value = e.target ? e.target.value : e
    setFormData((prev) => ({ ...prev, topics: value }))
  }

  const submitCreate = async (onSuccess) => {
    let hasError = false

    if (!formData.name.trim()) {
      setNameError(t.rooms?.createRoom?.nameRequired || "Room name is required")
      hasError = true
    } else {
      setNameError("")
    }

    if (formData.isPrivate && !formData.password.trim()) {
      setPasswordError(
        t.rooms?.createRoom?.passwordRequiredMessage ||
          "Private room requires a password.",
      )
      hasError = true
    } else {
      setPasswordError("")
    }

    if (hasError) return

    try {
      const data = new FormData()
      data.append("name", formData.name.trim())
      data.append("roomType", "4") // 4 = Custom Persistent
      data.append("languageType", selectedLanguage)
      data.append("privacy", formData.isPrivate ? "1" : "0")
      if (formData.isPrivate && formData.password.trim()) {
        data.append("password", formData.password.trim())
      }
      data.append("maxParticipants", String(formData.maxParticipants || 10))

      const primaryTopic = formData.topics?.[0] || "Other"
      data.append("topic", primaryTopic)
      if (formData.topics && formData.topics.length > 0) {
        formData.topics.forEach((topic) => data.append("topics", topic))
      }

      if (formData.selectedLevel) {
        data.append("requiredLevel", formData.selectedLevel)
      }
      if (formData.description) {
        data.append("description", formData.description)
      }
      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile)
      }

      const result = await createAdvancedRoom(data).unwrap()
      resetForm()

      if (onSuccess) onSuccess()

      const roomId = result?.data?.roomId || result?.roomId
      if (roomId) {
        navigate(`/${supportedLangCode}/meet/${roomId}`)
      }
    } catch (err) {
      console.error("Failed to create custom room:", err)
      const msg = err?.data?.message || err?.message || ""
      if (
        msg.includes("mật khẩu") ||
        msg.toLowerCase().includes("password")
      ) {
        setPasswordError(msg)
      } else {
        toast.error(msg || "Failed to create room")
      }
    }
  }

  const isCreateDisabled = isCreating || isQuotaFull

  return {
    formData,
    thumbnailFile,
    setThumbnailFile,
    handleChange,
    handleTopicChange,
    resetForm,
    submitCreate,
    isCreating,
    isQuotaFull,
    isCreateDisabled,
    selectedLanguage,
    nameError,
    passwordError,
  }
}

