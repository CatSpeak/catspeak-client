import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useUpdateCustomRoomMutation } from "@/store/api/roomsApi"

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

export const useEditCustomRoomForm = (room, open, onClose) => {
  const { lang } = useParams()
  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
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

  // Populate form fields whenever room or open state changes
  useEffect(() => {
    if (open && room) {
      const topicsList = Array.isArray(room.topics)
        ? room.topics
        : room.topic
          ? [room.topic]
          : []

      const isPrivate =
        room.isPrivate || room.privacy === "Private" || room.hasPassword === true

      setFormData({
        name: room.name || "",
        topics: topicsList,
        selectedLevel: room.requiredLevel || "",
        isPrivate: isPrivate,
        password: "", // Security: Do not prefill password
      })
      setThumbnailFile(room.thumbnailUrl || null)
    }
  }, [open, room])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTopicChange = (e) => {
    const value = e.target ? e.target.value : e
    if (Array.isArray(value) && value.length <= 3) {
      setFormData((prev) => ({ ...prev, topics: value }))
    }
  }

  const submitUpdate = async () => {
    if (!room || !formData.name.trim()) return

    try {
      const roomId = room.id || room.roomId
      const data = new FormData()
      data.append("Name", formData.name.trim())
      data.append("LanguageType", selectedLanguage)

      if (formData.selectedLevel) {
        data.append("RequiredLevel", formData.selectedLevel)
      }

      data.append("Privacy", formData.isPrivate ? "Private" : "Public")

      // Only append Password if private AND user actually entered a new password
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
      toast.success("Room updated successfully")

      if (onClose) onClose()
    } catch (err) {
      console.error("Failed to update custom room:", err)
      toast.error(err?.data?.message || "Failed to update room")
    }
  }

  const isDisabled = !formData.name.trim() || isUpdating

  const passwordPlaceholder = formData.isPrivate
    ? "Leave blank to keep current password"
    : "Enter room password"

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
  }
}
