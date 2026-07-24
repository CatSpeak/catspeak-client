import React, { useEffect } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TopicSelect from "./ui/TopicSelect"
import LevelSelector from "./ui/LevelSelector"
import { TOPICS, LEVELS } from "../config/constants"
import { useJoinRoomForm } from "../hooks/useJoinRoomForm"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import { useCallInterceptor } from "@/features/video-call/hooks/useCallInterceptor"

const scrollbarClasses =
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"

const JoinRoomModal = ({ open, onCancel }) => {
  const { t } = useLanguage()

  const {
    topics,
    selectedLevel,
    setSelectedLevel,
    handleTopicChange,
    resetForm,
    submitJoin,
    isJoinDisabled,
    selectedLanguage,
  } = useJoinRoomForm()

  const { showSwitchModal, intercept, confirmSwitch, cancelSwitch } =
    useCallInterceptor()

  useEffect(() => {
    if (open) resetForm()
  }, [open])

  const handleJoin = (e) => {
    if (e) e.preventDefault()
    const proceed = () => submitJoin(onCancel)
    if (!intercept(proceed)) proceed()
  }

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
        title={t.rooms?.joinRoom?.title || "Join Room"}
        showCloseButton={true}
        className="md:max-w-3xl"
        bodyClassName="px-4 sm:px-6 flex flex-col gap-6 flex-1 overflow-y-auto max-h-[65vh] max-sm:max-h-none"
        footer={
          <div className="flex flex-wrap justify-end gap-2 shrink-0 w-full">
            <PillButton onClick={onCancel} variant="secondary">
              {t.back || "Back"}
            </PillButton>

            <PillButton onClick={handleJoin} disabled={isJoinDisabled}>
              {t.rooms?.createRoom?.join || "Join Room"}
            </PillButton>
          </div>
        }
      >
        <div className={`flex flex-col gap-6 ${scrollbarClasses}`}>
          <TopicSelect
            value={topics}
            onChange={handleTopicChange}
            options={TOPICS}
            t={t}
          />

          <LevelSelector
            selectedLevel={selectedLevel}
            onSelect={(level) => setSelectedLevel(level)}
            levels={LEVELS[selectedLanguage]}
            t={t}
          />
        </div>
      </Modal>
    </>
  )
}

export default JoinRoomModal
