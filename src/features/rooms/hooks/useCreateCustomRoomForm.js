import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
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
  const { lang } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)

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
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTopicChange = (e) => {
    const value = e.target ? e.target.value : e
    setFormData((prev) => ({ ...prev, topics: value }))
  }

  const submitCreate = async (onSuccess) => {
    try {
      const data = new FormData()
      data.append("Name", formData.name.trim())
      data.append("LanguageType", selectedLanguage)
      if (formData.selectedLevel) {
        data.append("RequiredLevel", formData.selectedLevel)
      }
      data.append("Privacy", formData.isPrivate ? "Private" : "Public")
      if (formData.password.trim()) {
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
      toast.error(err?.data?.message || "Failed to create room")
    }
  }

  const isCreateDisabled =
    !formData.name.trim() ||
    isCreating ||
    isQuotaFull

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
  }
}
