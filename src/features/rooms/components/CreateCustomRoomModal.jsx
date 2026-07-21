import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, Crown, Users, Zap } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TopicSelect from "./ui/TopicSelect"
import LevelSelector from "./ui/LevelSelector"
import Switch from "@/shared/components/ui/inputs/Switch"
import { TOPICS, LEVELS } from "../config/constants"
import { toast } from "react-hot-toast"
import {
  useGetMyCustomRoomsQuery,
  useCreateCustomRoomMutation,
} from "@/store/api/roomsApi"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const getLanguageName = (langCode) => {
  switch (langCode) {
    case "zh": return "Chinese"
    case "vi": return "Vietnamese"
    case "en": return "English"
    default: return "English"
  }
}

const CreateCustomRoomModal = ({ open, onCancel }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const navigate = useNavigate()
  const ct = t.rooms?.customRooms || {}

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    topics: [],
    selectedLevel: "",
    isPrivate: false,
    password: "",
  })

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  // API hooks
  const { data: customRoomsData } = useGetMyCustomRoomsQuery(undefined, { skip: !open })
  const [createCustomRoom, { isLoading: isCreating }] = useCreateCustomRoomMutation()

  const customRooms = customRoomsData?.rooms || customRoomsData?.data || []
  const quota = customRoomsData?.quota || { used: customRooms.length, max: 3 }
  const isQuotaFull = quota.used >= quota.max

  useEffect(() => {
    if (open) resetForm()
  }, [open])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      topics: [],
      selectedLevel: "",
      isPrivate: false,
      password: "",
    })
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTopicChange = (event) => {
    const newValue = event.target ? event.target.value : event
    if (Array.isArray(newValue) && newValue.length <= 3) {
      handleChange("topics", newValue)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || isQuotaFull) return

    try {
      const body = {
        name: formData.name,
        description: formData.description,
        languageType: selectedLanguage,
        requiredLevel: formData.selectedLevel || undefined,
        topics: formData.topics.length > 0 ? formData.topics : ["Other"],
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password : undefined,
      }

      const result = await createCustomRoom(body).unwrap()
      toast.success(ct.createSuccess || "Custom room created successfully")
      resetForm()

      if (result?.roomId) {
        onCancel()
        navigate(`/${supportedLangCode}/meet/${result.roomId}`)
      } else {
        onCancel()
      }
    } catch (err) {
      console.error("Failed to create custom room:", err)
      toast.error(err?.data?.message || "Failed to create room")
    }
  }

  const isCreateDisabled =
    !formData.name.trim() ||
    isCreating ||
    isQuotaFull ||
    (formData.isPrivate && !formData.password.trim())

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={null}
      showCloseButton={false}
      className="max-w-sm sm:max-w-[850px] w-full max-sm:!fixed max-sm:!inset-0 max-sm:!m-0 max-sm:!max-w-none max-sm:!h-full max-sm:!w-full max-sm:!rounded-none max-sm:flex max-sm:flex-col sm:rounded-3xl"
      bodyClassName="flex flex-col flex-1 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-[28px] font-medium leading-tight">
              {ct.createTitle || "Create Custom Room"}
            </h2>
            <QuotaBadge quota={quota} ct={ct} />
          </div>
        </div>
        <button
          onClick={onCancel}
          className="flex shrink-0 items-center justify-center h-12 w-12 hover:bg-[#E5E5E5] rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Form Content */}
      <div className={`flex flex-col gap-6 max-h-[50vh] overflow-y-auto px-6 py-6 max-sm:max-h-none max-sm:flex-1 ${scrollbarClasses}`}>
        {/* Pro feature badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
            <Users size={12} />
            {ct.capacity || "Capacity: 100 participants"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
            <Zap size={12} />
            {ct.persistent || "Persistent Room"}
          </span>
        </div>

        {isQuotaFull && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <Crown size={16} className="shrink-0" />
            {ct.maxRoomsReached || "Maximum rooms reached"}
          </div>
        )}

        <TextInput
          id="custom-room-name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          label={ct.roomName || "Room Name"}
          placeholder={ct.roomNamePlaceholder || "e.g. My Study Group"}
          autoFocus
          autoComplete="off"
          containerClassName="gap-3"
          labelClassName="text-base"
          className="!h-12 !text-base !px-4 min-h-[48px]"
          disabled={isQuotaFull}
        />

        <TextInput
          id="custom-room-description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          label={ct.description || "Description"}
          placeholder={ct.descriptionPlaceholder || "What's this room about?"}
          autoComplete="off"
          multiline
          containerClassName="gap-3"
          labelClassName="text-base"
          className="!text-base !px-4 min-h-[48px]"
          maxLength={200}
          showCount
          disabled={isQuotaFull}
        />

        {/* Private room toggle */}
        <div className="flex items-center justify-between">
          <span className="text-base">
            {t.rooms?.createRoom?.privateRoom || "Private Room"}
          </span>
          <Switch
            checked={formData.isPrivate}
            onChange={(e) => {
              handleChange("isPrivate", e.target.checked)
              if (!e.target.checked) handleChange("password", "")
            }}
            disabled={isQuotaFull}
          />
        </div>

        {formData.isPrivate && (
          <TextInput
            id="custom-room-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            label={t.rooms?.createRoom?.passwordLabel || "Password"}
            placeholder={t.rooms?.createRoom?.passwordPlaceholder || "Enter room password"}
            autoComplete="new-password"
            containerClassName="gap-3"
            labelClassName="text-base"
            className="!h-12 !text-base !px-4 min-h-[48px]"
          />
        )}

        <TopicSelect
          value={formData.topics}
          onChange={handleTopicChange}
          options={TOPICS}
          t={t}
        />

        <LevelSelector
          selectedLevel={formData.selectedLevel}
          onSelect={(level) => handleChange("selectedLevel", level)}
          levels={LEVELS[selectedLanguage]}
          t={t}
        />
      </div>

      {/* Footer */}
      <div className="p-6 flex flex-wrap justify-end gap-4 shrink-0 border-t border-[#f0f0f0]">
        <PillButton
          onClick={onCancel}
          variant="secondary"
          className="h-12 text-base max-sm:flex-1"
        >
          {t.back || "Back"}
        </PillButton>
        <PillButton
          onClick={handleCreate}
          className="h-12 text-base max-sm:flex-1"
          loading={isCreating}
          loadingText={ct.creating || "Creating..."}
          disabled={isCreateDisabled}
        >
          {ct.create || "Create Room"}
        </PillButton>
      </div>
    </Modal>
  )
}

// --- Sub Components ---

const QuotaBadge = ({ quota, ct }) => {
  const isNearLimit = quota.used >= quota.max - 1
  const isFull = quota.used >= quota.max

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium mt-0.5 ${
      isFull ? "text-red-500" : isNearLimit ? "text-amber-600" : "text-[#606060]"
    }`}>
      <div className="flex gap-0.5">
        {Array.from({ length: quota.max }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < quota.used
                ? isFull ? "bg-red-400" : "bg-amber-500"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span>
        {isFull
          ? (ct.quotaFull || "Maximum reached").replace("{{max}}", quota.max)
          : (ct.quota || "{{used}}/{{max}} rooms used")
              .replace("{{used}}", quota.used)
              .replace("{{max}}", quota.max)
        }
      </span>
    </div>
  )
}

export default CreateCustomRoomModal
