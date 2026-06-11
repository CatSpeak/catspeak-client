import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useUpdateUserProfileMutation } from "@/store/api/userApi"

const EditNicknameModal = ({ open, onClose, user, t }) => {
  const [tempName, setTempName] = useState("")
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()

  useEffect(() => {
    if (open) {
      setTempName(user?.nickname || "")
    }
  }, [open, user?.nickname])

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      onClose()
      return
    }
    try {
      await updateProfile({ nickname: tempName.trim() }).unwrap()
      toast.success(t?.rooms?.waitingScreen?.updateNameSuccess || "Nickname updated successfully")
      onClose()
    } catch (err) {
      toast.error(t?.rooms?.waitingScreen?.updateNameError || "Failed to update nickname")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.rooms?.waitingScreen?.editName || "Edit Name"}
      className="max-w-md"
    >
      <div className="flex flex-col gap-6 pb-4">
        <TextInput
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder={t?.rooms?.waitingScreen?.namePlaceholder || "Enter nickname"}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveName()
          }}
          disabled={isUpdating}
          className="!h-11 text-[15px]"
          variant="square"
        />
        <div className="flex gap-3 justify-end">
          <PillButton
            variant="secondary"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 min-[426px]:flex-none bg-white border border-[#E5E5E5] text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            {t?.rooms?.waitingScreen?.cancelEdit || "Cancel"}
          </PillButton>
          <PillButton
            onClick={handleSaveName}
            disabled={isUpdating || !tempName.trim()}
            loading={isUpdating}
            className="flex-1 min-[426px]:flex-none"
          >
            {t?.rooms?.waitingScreen?.saveName || "Save"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default EditNicknameModal
