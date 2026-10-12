import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import { useCallInterceptor } from "@/features/video-call/hooks/useCallInterceptor"
import { useAuth } from "@/features/auth"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { useCreateCustomRoomForm } from "../hooks/useCreateCustomRoomForm"
import { useCreateRoomForm } from "../hooks/useCreateRoomForm"
import CreateRoomFormFields from "./ui/CreateRoomFormFields"
import RoomTypeSelector from "./ui/RoomTypeSelector"

const CreateRoomModal = ({ open, onCancel, initialMode = "group" }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const ct = t.rooms?.customRooms || {}
  const cr = t.rooms?.createRoom || {}
  const { isAuthenticated } = useAuth()

  const { isPro, limits } = usePlanFeatures()
  const maxParticipantsLimit = limits.maxParticipantsInCustomRooms || 100

  const [mode, setMode] = useState(initialMode)

  // Custom Room Form Hook
  const customForm = useCreateCustomRoomForm(open && mode === "custom")

  // Group Room Form Hook
  const groupForm = useCreateRoomForm()

  const { resetForm: resetGroupForm } = groupForm
  const { resetForm: resetCustomForm } = customForm

  // Reset back to the requested type each time the modal is (re)opened
  useEffect(() => {
    if (open) {
      setMode(initialMode)
      resetGroupForm()
      resetCustomForm()
    }
  }, [open, initialMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Call interceptor
  const { showSwitchModal, intercept, confirmSwitch, cancelSwitch } =
    useCallInterceptor()

  const handleCreateCustom = async () => {
    const proceed = () => customForm.submitCreate(onCancel)
    if (!(await intercept(proceed))) proceed()
  }

  const handleCreateGroup = async () => {
    const proceed = () => groupForm.submitCreate(onCancel)
    if (!(await intercept(proceed))) proceed()
  }

  const handleModeChange = (newMode) => {
    if (newMode === "custom" && !isPro) {
      onCancel()
      navigate("/pricing", {
        state: { highlightPlan: "pro", featureName: "Custom Rooms" },
      })
      return
    }
    setMode(newMode)
  }

  const activeForm = mode === "custom" ? customForm : groupForm
  const isCreating =
    mode === "custom" ? customForm.isCreating : groupForm.isCreating
  const isCreateDisabled =
    isCreating ||
    activeForm.isCreateDisabled ||
    (mode === "custom" && customForm.isQuotaFull)

  const handleCreateSubmit = () => {
    if (mode === "custom") {
      handleCreateCustom()
    } else {
      handleCreateGroup()
    }
  }

  const isCustomMode = mode === "custom"

  const roomTypeOptions = [
    {
      value: "group",
      label: cr.typeGroup || "Group",
      description: cr.typeGroupDesc || "Temporary room, up to 5 people",
      icon: <Users size={18} />,
    },
    {
      value: "custom",
      label: cr.typeCustom || "Custom",
      description: (
        cr.typeCustomDesc || "Persistent room, up to {max} people"
      ).replace("{max}", maxParticipantsLimit),
      icon: <Sparkles size={18} />,
      badge: ct.proBadge || "PRO",
      locked: !isPro,
    },
  ]

  return (
    <>
      <SwitchCallModal
        open={showSwitchModal}
        onCancel={cancelSwitch}
        onConfirm={confirmSwitch}
      />

      <Modal
        id="create-room-modal"
        open={open}
        onClose={onCancel}
        title={cr.title || "Create Room"}
        showCloseButton={true}
        className="md:max-w-3xl rounded-none md:rounded-xl md:border md:border-border"
        headerClassName="flex items-center justify-between p-4"
        subHeader={
          <RoomTypeSelector
            options={roomTypeOptions}
            value={mode}
            onChange={handleModeChange}
            ariaLabel={cr.roomTypeLabel || "Room type"}
          />
        }
        subHeaderClassName="px-4 mb-4 shrink-0"
        bodyClassName="px-4 flex flex-col flex-1 min-h-0 overflow-y-auto"
        footerClassName="p-4"
        footer={
          <div className="flex justify-end">
            <PillButton
              onClick={handleCreateSubmit}
              loading={isCreating}
              loadingText={
                isCustomMode
                  ? ct.creating || "Creating..."
                  : cr.creating || "Creating..."
              }
              disabled={isCreateDisabled}
              className="w-full sm:w-auto"
            >
              {isCustomMode
                ? ct.create || "Create Room"
                : cr.create || "Create Room"}
            </PillButton>
          </div>
        }
      >
        <CreateRoomFormFields
          mode={mode}
          formData={activeForm.formData}
          thumbnailFile={customForm.thumbnailFile}
          setThumbnailFile={customForm.setThumbnailFile}
          handleChange={activeForm.handleChange}
          handleTopicChange={activeForm.handleTopicChange}
          isQuotaFull={customForm.isQuotaFull}
          selectedLanguage={activeForm.selectedLanguage}
          nameError={activeForm.nameError || ""}
          passwordError={activeForm.passwordError}
          t={t}
        />
      </Modal>
    </>
  )
}

export default CreateRoomModal
