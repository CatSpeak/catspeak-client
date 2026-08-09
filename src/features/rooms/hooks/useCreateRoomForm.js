import { useState } from "react"
import { useCreateRoomMutation } from "@/store/api/roomsApi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"

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
  const { user } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const navigate = useNavigate()
  const { lang } = useParams()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

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

  const resetForm = () => {
    setFormData({
      name: "",
      topics: [],
      selectedLevel: "",
      isPrivate: false,
      password: "",
    })
    setNameError("")
    setPasswordError("")
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

    const data = new FormData()
    data.append("Name", formData.name.trim())
    data.append("RoomType", "Group")
    data.append("LanguageType", selectedLanguage)
    data.append("RequiredLevel", formData.selectedLevel || "")
    data.append("Privacy", formData.isPrivate ? "Private" : "Public")
    if (formData.isPrivate && formData.password.trim()) {
      data.append("Password", formData.password.trim())
    }

    const topicsList = formData.topics.length > 0 ? formData.topics : ["Other"]
    topicsList.forEach((topic) => data.append("Topics", topic))

    try {
      const result = await createRoom(data).unwrap()
      if (onSuccess) onSuccess()
      if (result.roomId) {
        const communityLang =
          lang || localStorage.getItem("communityLanguage") || "en"
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

      if (
        errorMessage.includes("mật khẩu") ||
        errorMessage.toLowerCase().includes("password")
      ) {
        setPasswordError(errorMessage)
      } else {
        toast.error(errorMessage, { duration: 4000 })
      }
    }
  }

  const isCreateDisabled = !selectedLanguage || isCreating

  return {
    formData,
    handleChange,
    handleTopicChange,
    resetForm,
    submitCreate,
    isCreating,
    isCreateDisabled,
    selectedLanguage,
    nameError,
    passwordError,
  }
}
