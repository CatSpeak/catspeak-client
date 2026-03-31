import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateRoomMutation } from "@/store/api/roomsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import TopicSelect from "./ui/TopicSelect"
import LevelSelector from "./ui/LevelSelector"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Modal from "@/shared/components/ui/Modal"
import { motion, AnimatePresence } from "framer-motion"
import { TOPICS, LEVELS } from "../config/constants"

const CreateRoomModal = ({ open, onCancel }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { lang } = useParams()

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const isLoading = isCreating

  const getLanguageName = (langCode) => {
    switch (langCode) {
      case "zh":
        return "Chinese"
      case "vi":
        return "Vietnamese"
      case "en":
        return "English"
      default:
        return "English" // Default fallback
    }
  }

  // Derive selectedLanguage directly from URL params
  const supportedLangCode = ["zh", "vi", "en"].includes(lang) ? lang : "en"
  const selectedLanguage = getLanguageName(supportedLangCode)

  const [selectedLevel, setSelectedLevel] = useState("")

  // Form State
  const [mode, setMode] = useState("join") // "join" | "create"
  const [name, setName] = useState("")
  const [topics, setTopics] = useState([])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName("")
      setTopics([])
      setSelectedLevel("")
      setMode("join")
    }
  }, [open])
  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setName("")
    setTopics([])
    setSelectedLevel("")
  }

  const handleCancel = () => {
    onCancel()
  }

  const handleJoin = (e) => {
    if (e) e.preventDefault()
    if (!selectedLanguage) return

    const preferences = {
      roomType: "Group",
      topics: topics.length > 0 ? topics : [],
      languageType: selectedLanguage,
      requiredLevel: selectedLevel || undefined,
    }

    handleCancel()
    navigate("/queue", { state: preferences })
  }

  const handleCreate = async (e) => {
    if (e) e.preventDefault()
    if (!selectedLanguage) return

    const formData = new FormData()
    formData.append("Name", name || "")
    formData.append("RoomType", "Group") // Group room
    formData.append("LanguageType", selectedLanguage)
    formData.append("RequiredLevel", selectedLevel || "")

    const topicsList = topics.length > 0 ? topics : ["Other"]
    topicsList.forEach((topic) => formData.append("Topics", topic))

    console.log("[CreateRoomModal] CreateRoom payload:", {
      Name: name || "",
      RoomType: "Group",
      LanguageType: selectedLanguage,
      RequiredLevel: selectedLevel || "",
      Topics: topicsList,
    })

    try {
      const createResult = await createRoom(formData).unwrap()

      const roomId = createResult.roomId
      handleCancel()

      if (roomId) {
        const communityLang = lang || localStorage.getItem("communityLanguage") || "en"
        navigate(`/${communityLang}/meet/${roomId}`)
      }
    } catch (err) {
      console.error("Failed to create room:", err)
    }
  }

  const handleTopicChange = (event) => {
    // Check if event is from custom component (has target.value) or standard event
    const newValue = event.target ? event.target.value : event
    const maxLimit = 3

    // Safety check for array
    if (Array.isArray(newValue)) {
      if (newValue.length <= maxLimit) {
        setTopics(newValue)
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      title={
        mode === "create"
          ? t.rooms.createRoom.title
          : t.rooms?.joinRoom?.title || "Join Room"
      }
      className="max-w-sm min-[426px]:max-w-md max-[425px]:max-w-none max-[425px]:h-full max-[425px]:flex max-[425px]:flex-col"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col flex-1"
        >
          <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto -mx-5 px-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5 max-[425px]:max-h-none max-[425px]:flex-1">
            {/* Room Name */}
            {mode === "create" && (
              <TextInput
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label={t.rooms.createRoom.nameLabel}
                placeholder={t.rooms.createRoom.namePlaceholder}
                autoFocus
              />
            )}

            {/* Topics */}
            <TopicSelect
              value={topics}
              onChange={handleTopicChange}
              options={TOPICS}
              t={t}
            />

            {/* Level Selection */}
            <LevelSelector
              selectedLevel={selectedLevel}
              onSelect={setSelectedLevel}
              levels={LEVELS[selectedLanguage]}
              t={t}
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {mode === "join" ? (
              <>
                <PillButton
                  onClick={handleCancel}
                  variant="secondary"
                  className="h-10"
                >
                  {t.rooms.createRoom.cancel}
                </PillButton>
                <PillButton
                  onClick={() => handleModeSwitch("create")}
                  variant="outline"
                  className="h-10"
                >
                  {t.rooms.createRoom.create}
                </PillButton>
                <PillButton
                  onClick={handleJoin}
                  className="h-10"
                  disabled={!selectedLanguage || isLoading}
                >
                  {t.rooms.createRoom.join}
                </PillButton>
              </>
            ) : (
              <>
                <PillButton
                  onClick={() => handleModeSwitch("join")}
                  variant="secondary"
                  className="h-10"
                >
                  {t.back || "Back"}
                </PillButton>
                <PillButton
                  onClick={handleCreate}
                  className="h-10"
                  loading={isCreating}
                  loadingText={t.rooms.createRoom.creating}
                  disabled={!selectedLanguage || isLoading || !name.trim()}
                >
                  {t.rooms.createRoom.create}
                </PillButton>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  )
}

export default CreateRoomModal
