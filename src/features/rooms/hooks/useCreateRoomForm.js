import { useState } from "react"
import { useCreateRoomMutation } from "@/store/api/roomsApi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"

const INITIAL_STATE = {
  mode: "join",
  name: "",
  topics: [],
  selectedLevel: "",
  isPrivate: false,
  password: "",
  thumbnail: null
}

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh": return "Chinese"
    case "vi": return "Vietnamese"
    case "en": return "English"
    default: return "English"
  }
}

export const useCreateRoomForm = () => {
  const [formData, setFormData] = useState(INITIAL_STATE)
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const navigate = useNavigate()
  const { lang } = useParams()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(INITIAL_STATE)
  }

  const switchMode = (newMode) => {
    setFormData({
      ...INITIAL_STATE,
      mode: newMode
    })
  }

  const handleTopicChange = (event) => {
    const newValue = event.target ? event.target.value : event
    const maxLimit = 3
    if (Array.isArray(newValue) && newValue.length <= maxLimit) {
      handleChange("topics", newValue)
    }
  }

  const submitJoin = (onSuccess) => {
    if (!selectedLanguage) return
    const preferences = {
      roomType: "Group",
      topics: formData.topics.length > 0 ? formData.topics : [],
      languageType: selectedLanguage,
      requiredLevel: formData.selectedLevel || undefined,
    }
    if (onSuccess) onSuccess()
    navigate("/queue", { state: preferences })
  }

  const submitCreate = async (onSuccess) => {
    if (!selectedLanguage) return

    const data = new FormData()
    data.append("Name", formData.name || "")
    data.append("RoomType", "Group")
    data.append("LanguageType", selectedLanguage)
    data.append("RequiredLevel", formData.selectedLevel || "")
    data.append("Privacy", formData.isPrivate ? "Private" : "Public")

    if (formData.isPrivate && formData.password) {
      data.append("Password", formData.password)
    }

    if (formData.thumbnail) {
      data.append("Thumbnail", formData.thumbnail)
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
      
      let errorMessage = err?.data?.message || err?.message || t?.errors?.generalFailed || "Failed to create room."
      
      if (errorCode === "MAX_ACTIVE_ROOMS_REACHED") {
        errorMessage = t?.errors?.maxActiveRoomsReached || errorMessage
      }
      
      toast.error(errorMessage, { duration: 4000 })
    }
  }

  return {
    formData,
    handleChange,
    handleTopicChange,
    resetForm,
    switchMode,
    submitJoin,
    submitCreate,
    isCreating,
    selectedLanguage
  }
}
