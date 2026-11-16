import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useUpdateUserProfileMutation } from "@/store/api/userApi"

const EditNicknameModal = ({ open, onClose, user, t }) => {
  const [tempName, setTempName] = useState("")
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation()

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setTempName(user?.nickname || "")
      })
    }
  }, [open, user?.nickname])

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      onClose()
      return
    }
    try {
      await updateProfile({ nickname: tempName.trim() }).unwrap()
      toast.success(
        t?.rooms?.waitingScreen?.updateNameSuccess ||
          "Nickname updated successfully",
      )
      onClose()
    } catch {
      toast.error(
        t?.rooms?.waitingScreen?.updateNameError || "Failed to update nickname",
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.rooms?.waitingScreen?.editName || "Edit Name"}
      showCloseButton={false}
      className="md:max-w-[400px]"
      headerClassName="flex items-center justify-between p-4"
      bodyClassName="px-4"
      footerClassName="p-4"
      footer={
        <div className="flex gap-2 justify-end">
          <PillButton
            variant="secondary"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 sm:flex-none w-20 h-auto font-medium"
          >
            {t?.rooms?.waitingScreen?.cancelEdit || "Cancel"}
          </PillButton>
          <PillButton
            onClick={handleSaveName}
            disabled={isUpdating || !tempName.trim()}
            loading={isUpdating}
            className="flex-1 sm:flex-none w-20 h-auto"
          >
            {t?.rooms?.waitingScreen?.saveName || "Save"}
          </PillButton>
        </div>
      }
    >
      <TextInput
        type="text"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        placeholder={
          t?.rooms?.waitingScreen?.namePlaceholder || "Enter nickname"
        }
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSaveName()
        }}
        disabled={isUpdating}
        variant="square"
      />
    </Modal>
  )
}

export default EditNicknameModal
