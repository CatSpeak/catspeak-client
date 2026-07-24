import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Lock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import SegmentedButtons from "@/shared/components/ui/buttons/SegmentedButtons"
import SwitchCallModal from "@/features/video-call/components/SwitchCallModal"
import { useCallInterceptor } from "@/features/video-call/hooks/useCallInterceptor"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import { useCreateCustomRoomForm } from "../hooks/useCreateCustomRoomForm"
import { useCreateRoomForm } from "../hooks/useCreateRoomForm"
import CreateRoomFormFields from "./ui/CreateRoomFormFields"

const CreateRoomModal = ({ open, onCancel, initialMode = "group" }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const ct = t.rooms?.customRooms || {}
  const { isAuthenticated } = useAuth()

  const { data: profileResponse } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  })
  const userTier = profileResponse?.data?.tier?.toLowerCase()
  const isPro = userTier === "pro"

  const [mode, setMode] = useState(initialMode)

  useEffect(() => {
    if (open) {
      setMode(initialMode)
    }
  }, [open, initialMode])

  // Custom Room Form Hook
  const customForm = useCreateCustomRoomForm(open && mode === "custom")

  // Group Room Form Hook
  const groupForm = useCreateRoomForm()

  // Call interceptor
  const { showSwitchModal, intercept, confirmSwitch, cancelSwitch } =
    useCallInterceptor()

  const handleCreateCustom = () => {
    const proceed = () => customForm.submitCreate(onCancel)
    if (!intercept(proceed)) proceed()
  }

  const handleCreateGroup = () => {
    const proceed = () => groupForm.submitCreate(onCancel)
    if (!intercept(proceed)) proceed()
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
    mode === "custom" ? customForm.isCreateDisabled : groupForm.isCreateDisabled

  const handleCreateSubmit = () => {
    if (mode === "custom") {
      handleCreateCustom()
    } else {
      handleCreateGroup()
    }
  }

  const roomTypeOptions = [
    { value: "group", label: "Group" },
    {
      value: "custom",
      label: "Custom",
      startIcon: !isPro ? <Lock /> : undefined,
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
        open={open}
        onClose={onCancel}
        title={t.rooms?.createRoom?.title || "Create Room"}
        showCloseButton={true}
        className="md:max-w-3xl"
        subHeader={
          <SegmentedButtons
            options={roomTypeOptions}
            value={mode}
            onChange={handleModeChange}
          />
        }
        bodyClassName="px-4 sm:px-6 flex flex-col gap-6 flex-1 overflow-y-auto max-h-[65vh] max-sm:max-h-none"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full">
            <PillButton onClick={onCancel} variant="secondary">
              {t.back || "Back"}
            </PillButton>

            <PillButton
              onClick={handleCreateSubmit}
              loading={isCreating}
              loadingText={ct.creating || "Creating..."}
              disabled={isCreateDisabled}
            >
              {ct.create || "Create Room"}
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
          t={t}
        />
      </Modal>
    </>
  )
}

export default CreateRoomModal
