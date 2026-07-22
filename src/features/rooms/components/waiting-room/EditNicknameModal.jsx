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
      toast.success(
        t?.rooms?.waitingScreen?.updateNameSuccess ||
        "Nickname updated successfully",
      )
      onClose()
    } catch (err) {
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
      className="md:max-w-[400px]"
      headerClassName="flex items-center justify-between p-6"
      bodyClassName="px-6 pb-6 flex-1"
    >
      <div className="flex flex-col gap-3">
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
          className="!h-11 text-[15px] rounded-xl"
          variant="square"
        />
        <div className="flex gap-3 justify-end">
          <PillButton
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 min-[426px]:flex-none w-20 h-auto font-medium"
          >
            {t?.rooms?.waitingScreen?.cancelEdit || "Cancel"}
          </PillButton>
          <PillButton
            onClick={handleSaveName}
            disabled={isUpdating || !tempName.trim()}
            loading={isUpdating}
            className="flex-1 min-[426px]:flex-none w-20 h-auto"
          >
            {t?.rooms?.waitingScreen?.saveName || "Save"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default EditNicknameModal
