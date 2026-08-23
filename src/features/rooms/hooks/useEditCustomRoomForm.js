import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useUpdateCustomRoomMutation } from "@/store/api/roomsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh":
      return "Chinese"
    case "vi":
      return "Vietnamese"
    case "en":
      return "English"
    case "ja":
      return "Japanese"
    default:
      return "English"
  }
}

export const useEditCustomRoomForm = (room, open, onClose) => {
  const { lang } = useParams()
  const { t } = useLanguage()
  const supportedLangCode = ["zh", "vi", "en", "ja"].includes(lang)
    ? lang
    : "en"
  const selectedLanguage = room?.languageType || getLanguageName(supportedLangCode)

  const [updateCustomRoom, { isLoading: isUpdating }] =
    useUpdateCustomRoomMutation()

  const [formData, setFormData] = useState({
    name: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Populate form fields whenever room or open state changes
  useEffect(() => {
    if (open && room) {
      const topicsList = Array.isArray(room.topics)
        ? room.topics
        : room.topic
          ? [room.topic]
          : []

      const isPrivate = Boolean(room.hasPassword || room.privacy === "Private")

      setFormData({
        name: room.name || "",
        topics: topicsList,
        selectedLevel: room.requiredLevel || "",
        isPrivate: isPrivate,
        password: room.password || "",
      })
      setThumbnailFile(room.thumbnailUrl || null)
      setNameError("")
      setPasswordError("")
    }
  }, [open, room])

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
    if (Array.isArray(value) && value.length <= 3) {
      setFormData((prev) => ({ ...prev, topics: value }))
    }
  }

  const submitUpdate = async () => {
    if (!room) return
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
      const roomId = room.id || room.roomId
      const data = new FormData()
      data.append("Name", formData.name.trim())
      data.append("LanguageType", selectedLanguage)

      if (formData.selectedLevel) {
        data.append("RequiredLevel", formData.selectedLevel)
      }

      data.append("Privacy", formData.isPrivate ? "Private" : "Public")

      // Only append Password if private and user actually entered a new password
      if (formData.isPrivate && formData.password.trim()) {
        data.append("Password", formData.password.trim())
      }

      const topicsList =
        formData.topics.length > 0 ? formData.topics : ["Other"]
      topicsList.forEach((topic) => data.append("Topics", topic))

      // Append new thumbnail file if user uploaded one
      if (thumbnailFile instanceof File) {
        data.append("Thumbnail", thumbnailFile)
      }

      await updateCustomRoom({ id: roomId, data }).unwrap()

      if (onClose) onClose()
    } catch (err) {
      console.error("Failed to update custom room:", err)
      const msg = err?.data?.message || err?.message || ""
      if (
        msg.includes("mật khẩu") ||
        msg.toLowerCase().includes("password")
      ) {
        setPasswordError(msg)
      } else {
        toast.error(msg || "Failed to update room")
      }
    }
  }

  const isDisabled = isUpdating

  const passwordPlaceholder = "Enter room password"

  return {
    formData,
    thumbnailFile,
    setThumbnailFile,
    handleChange,
    handleTopicChange,
    submitUpdate,
    isUpdating,
    isDisabled,
    selectedLanguage,
    passwordPlaceholder,
    nameError,
    passwordError,
  }
}
