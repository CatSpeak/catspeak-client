import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import TopicSelect from "./ui/TopicSelect"
import LevelSelector from "./ui/LevelSelector"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"
import { motion, AnimatePresence } from "framer-motion"
import { TOPICS, LEVELS } from "../config/constants"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import { useCreateRoomForm } from "../hooks/useCreateRoomForm"
import { useCallInterceptor } from "@/features/video-call/hooks/useCallInterceptor"
import { X } from "lucide-react"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

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

const CreateRoomModal = ({ open, onCancel }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { lang } = useParams()

  const {
    formData,
    handleChange,
    handleTopicChange,
    resetForm,
    switchMode,
    createRoom,
    isCreating,
  } = useCreateRoomForm()

  const { showSwitchModal, intercept, confirmSwitch, cancelSwitch } =
    useCallInterceptor()

  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  useEffect(() => {
    if (open) resetForm()
  }, [open])

  const proceedJoin = () => {
    if (!selectedLanguage) return
    const preferences = {
      roomType: "Group",
      topics: formData.topics.length > 0 ? formData.topics : [],
      languageType: selectedLanguage,
      requiredLevel: formData.selectedLevel || undefined,
    }
    onCancel()
    navigate("/queue", { state: preferences })
  }

  const handleJoin = (e) => {
    if (e) e.preventDefault()
    if (!intercept(proceedJoin)) proceedJoin()
  }

  const proceedCreate = async () => {
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
      onCancel()
      if (result.roomId) {
        const communityLang =
          lang || localStorage.getItem("communityLanguage") || "en"
        navigate(`/${communityLang}/meet/${result.roomId}`)
      }
    } catch (err) {
      console.error("Failed to create room:", err)
    }
  }

  const handleCreate = (e) => {
    if (e) e.preventDefault()
    if (!intercept(proceedCreate)) proceedCreate()
  }

  const isJoinDisabled = !selectedLanguage
  const isCreateDisabled =
    !selectedLanguage ||
    isCreating ||
    !formData.name.trim() ||
    (formData.isPrivate && !formData.password.trim())

  return (
    <>
      <SwitchCallModal
        open={showSwitchModal}
        onCancel={cancelSwitch}
        onConfirm={confirmSwitch}
      />
      <Modal
        open={open}
        onClose={onCancel}
        title={null}
        showCloseButton={false}
        className="max-w-sm min-[426px]:max-w-[800px] w-full max-[425px]:max-w-none max-[425px]:h-full max-[425px]:flex max-[425px]:flex-col rounded-none min-[426px]:rounded-3xl"
        bodyClassName="flex flex-col flex-1 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex items-center justify-between p-6 shrink-0">
              <h2 className="text-[28px] font-medium">
                {formData.mode === "create"
                  ? t.rooms.createRoom.title
                  : t.rooms?.joinRoom?.title || "Join Room"}
              </h2>
              <button
                onClick={onCancel}
                className="flex shrink-0 items-center justify-center h-12 w-12 hover:bg-[#E5E5E5] rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className={`flex flex-col gap-6 max-h-[60vh] overflow-y-auto px-6 pb-6 max-[425px]:max-h-none max-[425px]:flex-1 ${scrollbarClasses}`}
            >
              {formData.mode === "create" && (
                <CreateFormInputs
                  formData={formData}
                  handleChange={handleChange}
                  t={t}
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

            <ModalFooter
              mode={formData.mode}
              onCancel={onCancel}
              onSwitchMode={switchMode}
              onJoin={handleJoin}
              onCreate={handleCreate}
              isCreating={isCreating}
              disabledJoin={isJoinDisabled}
              disabledCreate={isCreateDisabled}
              t={t}
            />
          </motion.div>
        </AnimatePresence>
      </Modal>
    </>
  )
}

// --- Sub Components ---
const CreateFormInputs = ({ formData, handleChange, t }) => (
  <div className="flex flex-col gap-6">
    <TextInput
      id="name"
      value={formData.name}
      onChange={(e) => handleChange("name", e.target.value)}
      label={t.rooms?.createRoom?.nameLabel || "Room name"}
      placeholder={
        t.rooms?.createRoom?.namePlaceholder || "e.g. Chill Practice"
      }
      autoFocus
      autoComplete="off"
      containerClassName="gap-3"
      labelClassName="text-base"
      className="!h-12 !text-base !px-4 min-h-[48px]"
    />
    <div className="flex flex-col gap-3">
      <label>{t.rooms?.createRoom?.thumbnailLabel || "Room Thumbnail"}</label>
      <div className="flex items-center gap-3">
        <label className="inline-flex min-h-[48px] h-12 items-center rounded-full px-4 text-base border transition-colors border-[#C6C6C6] hover:bg-[#F2F2F2] cursor-pointer">
          {t.rooms?.createRoom?.uploadImage || "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleChange("thumbnail", e.target.files[0])
              }
            }}
          />
        </label>
        <span className="text-sm text-[#606060]">
          {formData.thumbnail
            ? formData.thumbnail.name
            : t.rooms?.createRoom?.noFileChosen || "No file chosen"}
        </span>
      </div>
    </div>
    {/* <div className="flex items-center justify-between">
      <span className="text-base">
        {t.rooms?.createRoom?.privateRoom || "Private Room"}
      </span>
      <Switch
        checked={formData.isPrivate}
        onChange={(e) => {
          handleChange("isPrivate", e.target.checked)
          if (!e.target.checked) handleChange("password", "")
        }}
      />
    </div> */}
    {formData.isPrivate && (
      <TextInput
        id="password"
        type="password"
        value={formData.password}
        onChange={(e) => handleChange("password", e.target.value)}
        label={t.rooms?.createRoom?.passwordLabel || "Password"}
        placeholder={
          t.rooms?.createRoom?.passwordPlaceholder || "Enter room password"
        }
        autoComplete="new-password"
        containerClassName="gap-3"
        labelClassName="text-base"
        className="!h-12 !text-base !px-4 min-h-[48px]"
      />
    )}
  </div>
)

const ModalFooter = ({
  mode,
  onCancel,
  onSwitchMode,
  onJoin,
  onCreate,
  isCreating,
  disabledJoin,
  disabledCreate,
  t,
}) => {
  if (mode === "join") {
    return (
      <div className="p-6 flex flex-wrap justify-end gap-6 shrink-0">
        <PillButton
          onClick={() => onSwitchMode("create")}
          variant="outline"
          className="h-12 text-base max-[425px]:flex-1"
        >
          {t.rooms.createRoom.create}
        </PillButton>
        <PillButton
          onClick={onJoin}
          className="h-12 text-base max-[425px]:flex-1"
          disabled={disabledJoin}
        >
          {t.rooms.createRoom.join}
        </PillButton>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-wrap justify-end gap-6 shrink-0">
      <PillButton
        onClick={() => onSwitchMode("join")}
        variant="secondary"
        className="h-12 text-base max-[425px]:flex-1"
      >
        {t.back || "Back"}
      </PillButton>
      <PillButton
        onClick={onCreate}
        className="h-12 text-base max-[425px]:flex-1"
        loading={isCreating}
        loadingText={t.rooms.createRoom.creating}
        disabled={disabledCreate}
      >
        {t.rooms.createRoom.create}
      </PillButton>
    </div>
  )
}

export default CreateRoomModal
