import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetMyCustomRoomsQuery,
  useCreateCustomRoomMutation,
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
  const { user } = useAuth()
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

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

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const { data: customRoomsData } = useGetMyCustomRoomsQuery(undefined, {
    skip: !open,
  })
  const [createCustomRoom, { isLoading: isCreating }] =
    useCreateCustomRoomMutation()

  const isQuotaFull = customRoomsData?.canCreateCustomRoom === false

  const resetForm = () => {
    setFormData({
      name: "",
      topics: [],
      selectedLevel: "",
      isPrivate: false,
      password: "",
    })
    setThumbnailFile(null)
    setNameError("")
    setPasswordError("")
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

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
      data.append("Name", formData.name.trim())
      data.append("LanguageType", selectedLanguage)
      if (formData.selectedLevel) {
        data.append("RequiredLevel", formData.selectedLevel)
      }
      data.append("Privacy", formData.isPrivate ? "Private" : "Public")
      if (formData.isPrivate && formData.password.trim()) {
        data.append("Password", formData.password.trim())
      }

      const topicsList =
        formData.topics.length > 0 ? formData.topics : ["Other"]
      topicsList.forEach((topic) => data.append("Topics", topic))

      if (thumbnailFile) {
        data.append("Thumbnail", thumbnailFile)
      }

      const result = await createCustomRoom(data).unwrap()
      resetForm()

      if (onSuccess) onSuccess()

      if (result?.roomId) {
        navigate(`/${supportedLangCode}/meet/${result.roomId}`)
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
