import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import CreateRoomFormFields from "./ui/CreateRoomFormFields"
import { useEditCustomRoomForm } from "../hooks/useEditCustomRoomForm"

const EditRoomModal = ({ open, room, onClose }) => {
  const { t } = useLanguage()
  const ct = t.rooms?.customRooms || {}

  const {
    formData,
    thumbnailFile,
    setThumbnailFile,
    handleChange,
    handleTopicChange,
    submitUpdate,
    isUpdating,
    isDisabled,
    selectedLanguage,
    passwordPlaceholder,
  } = useEditCustomRoomForm(room, open, onClose)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ct.editTitle || "Edit Custom Room"}
      showCloseButton={true}
      className="md:max-w-3xl"
      bodyClassName="px-4 sm:px-6 flex flex-col gap-6 flex-1 overflow-y-auto max-h-[65vh] max-sm:max-h-none"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full">
          <PillButton onClick={onClose} variant="secondary">
            {t.back || "Back"}
          </PillButton>
          <PillButton
            onClick={submitUpdate}
            loading={isUpdating}
            loadingText={ct.saving || "Saving..."}
            disabled={isDisabled}
          >
            {ct.save || "Save Changes"}
          </PillButton>
        </div>
      }
    >
      <CreateRoomFormFields
        mode="custom"
        formData={formData}
        thumbnailFile={thumbnailFile}
        setThumbnailFile={setThumbnailFile}
        handleChange={handleChange}
        handleTopicChange={handleTopicChange}
        isQuotaFull={false}
        selectedLanguage={selectedLanguage}
        passwordPlaceholder={passwordPlaceholder}
        t={t}
      />
    </Modal>
  )
}

export default EditRoomModal
