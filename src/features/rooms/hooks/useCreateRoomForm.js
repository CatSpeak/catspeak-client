import { useState } from "react"
import { useCreateRoomMutation } from "@/store/api/roomsApi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"

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

export const useCreateRoomForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const navigate = useNavigate()
  const { lang } = useParams()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      topics: [],
      selectedLevel: "",
      isPrivate: false,
      password: "",
    })
  }

  const handleTopicChange = (event) => {
    const newValue = event.target ? event.target.value : event
    const maxLimit = 3
    if (Array.isArray(newValue) && newValue.length <= maxLimit) {
      handleChange("topics", newValue)
    }
  }

  const submitCreate = async (onSuccess) => {
    if (!selectedLanguage) return

    const data = new FormData()
    data.append("Name", formData.name.trim() || "")
    data.append("RoomType", "Group")
    data.append("LanguageType", selectedLanguage)
    data.append("RequiredLevel", formData.selectedLevel || "")
    data.append("Privacy", formData.isPrivate ? "Private" : "Public")

    if (formData.password.trim()) {
      data.append("Password", formData.password.trim())
    }

    const topicsList = formData.topics.length > 0 ? formData.topics : ["Other"]
    topicsList.forEach((topic) => data.append("Topics", topic))

    try {
      const result = await createRoom(data).unwrap()
      if (onSuccess) onSuccess()
      if (result.roomId) {
        const communityLang = lang || localStorage.getItem("communityLanguage") || "en"
        navigate(`/${communityLang}/meet/${result.roomId}`)
      }
    } catch (err) {
      console.error("Failed to create room:", err)
      const errorCode = err?.data?.errorCode
      let errorMessage =
        err?.data?.message || err?.message || "Failed to create room."

      if (errorCode === "MAX_ACTIVE_ROOMS_REACHED") {
        errorMessage = "Maximum active rooms reached."
      }

      toast.error(errorMessage, { duration: 4000 })
    }
  }

  const isCreateDisabled =
    !selectedLanguage || isCreating || !formData.name.trim()

  return {
    formData,
    handleChange,
    handleTopicChange,
    resetForm,
    submitCreate,
    isCreating,
    isCreateDisabled,
    selectedLanguage,
  }
}
