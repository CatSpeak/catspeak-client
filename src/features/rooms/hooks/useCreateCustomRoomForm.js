import { useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetMyCustomRoomsQuery,
  useCreateAdvancedRoomMutation,
} from "@/store/api/roomsApi"
import { validateRoomName } from "@/features/rooms/utils/roomNameValidation"
import { useSubmitLock } from "@/shared/hooks/useSubmitLock"
import {
  SAFE_RASTER_IMAGE_EXTENSIONS,
  SAFE_RASTER_IMAGE_MIME_TYPES,
  validateUploadFile,
} from "@/shared/utils/fileValidation"

const MAX_ROOM_PARTICIPANTS = 50
const MIN_ROOM_PARTICIPANTS = 2
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024

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
    languageType: "",
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const supportedLangCode = ["zh", "vi", "en", "ja"].includes(lang)
    ? lang
    : "en"
  const defaultLanguage = getLanguageName(supportedLangCode)
  const selectedLanguage = formData.languageType || defaultLanguage

  const { data: customRoomsData } = useGetMyCustomRoomsQuery(undefined, {
    skip: !open,
  })
  const [createAdvancedRoom, { isLoading: isCreating }] =
    useCreateAdvancedRoomMutation()
  const { runLocked } = useSubmitLock()

  const handleSetThumbnailFile = useCallback((file) => {
    if (!file) {
      setThumbnailFile(null)
      return true
    }
    const validation = validateUploadFile(file, {
      allowedExtensions: SAFE_RASTER_IMAGE_EXTENSIONS,
      allowedMimeTypes: SAFE_RASTER_IMAGE_MIME_TYPES,
      maxBytes: MAX_THUMBNAIL_BYTES,
    })
    if (!validation.valid) {
      toast.error(
        validation.reason === "size"
          ? "Thumbnail exceeds 5MB limit."
          : "Only PNG, JPG, or WEBP images are allowed.",
      )
      return false
    }
    setThumbnailFile(file)
    return true
  }, [])

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
      languageType: "",
    })
    setThumbnailFile(null)
    setNameError("")
    setPasswordError("")
  }, [])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "name") {
      setNameError(
        validateRoomName(value, {
          messages: { tooLong: t.rooms?.customRooms?.nameMaxLength },
        }),
      )
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
    await runLocked(async () => {
      let hasError = false

      const nameValidationError = validateRoomName(formData.name, {
        required: true,
        messages: {
          required: t.rooms?.createRoom?.nameRequired,
          tooLong: t.rooms?.customRooms?.nameMaxLength,
        },
      })
      if (nameValidationError) {
        setNameError(nameValidationError)
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

      const rawMax = Number(formData.maxParticipants)
      const clampedParticipants = Number.isFinite(rawMax)
        ? Math.min(
            MAX_ROOM_PARTICIPANTS,
            Math.max(MIN_ROOM_PARTICIPANTS, Math.trunc(rawMax)),
          )
        : 10

      try {
        const data = new FormData()
        data.append("name", formData.name.trim())
        data.append("roomType", "4") // 4 = Custom Persistent
        data.append("languageType", selectedLanguage)
        data.append("privacy", formData.isPrivate ? "1" : "0")
        if (formData.isPrivate && formData.password.trim()) {
          data.append("password", formData.password.trim())
        }
        data.append("maxParticipants", String(clampedParticipants))

        const primaryTopic = formData.topics?.[0] || "Other"
        data.append("topic", primaryTopic)
        if (formData.topics && formData.topics.length > 0) {
          formData.topics.forEach((topic) => data.append("topics", topic))
        }

        if (formData.selectedLevel) {
          data.append("requiredLevel", formData.selectedLevel)
        }
        const trimmedDesc = formData.description?.trim()
        if (trimmedDesc) {
          data.append("description", trimmedDesc)
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
    })
  }

  const isCreateDisabled = isCreating || isQuotaFull

  return {
    formData,
    thumbnailFile,
    setThumbnailFile: handleSetThumbnailFile,
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

