import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { Edit2 } from "lucide-react"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"

import {
  useRenameMaterialMutation,
  useRenameFolderMutation,
} from "@/store/api/materialApi"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"

const RenameMaterialModal = ({ open, onClose, item }) => {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [renameMaterial, { isLoading: isRenamingMaterial }] =
    useRenameMaterialMutation()
  const [renameFolder, { isLoading: isRenamingFolder }] =
    useRenameFolderMutation()

  const isRenaming = isRenamingMaterial || isRenamingFolder

  const [prevItem, setPrevItem] = useState(item)
  const [prevOpen, setPrevOpen] = useState(open)

  if (item !== prevItem || open !== prevOpen) {
    setPrevItem(item)
    setPrevOpen(open)
    if (open && item) {
      setName(item.fileName || item.folderName || item.name || "")
    }
  }

  const handleRename = async () => {
    if (!name.trim() || !item) return
    console.log(name)
    try {
      const isFolder =
        item.type === "folder" ||
        item._type === "folder" ||
        (!item.fileName && !item.fileUrl)

      if (isFolder) {
        await renameFolder({
          id: item.id || item.folderId,
          name: name.trim(),
        }).unwrap()
      } else {
        await renameMaterial({
          id: item.id,
          fileName: name.trim(),
        }).unwrap()
      }
      toast.success(t.materials.renameSuccess)
      onClose()
    } catch (error) {
      console.error("Failed to rename", error)
      const errCode = error?.data?.message
      const errMsg = errCode
        ? t.materials.errors?.[errCode] || errCode
        : t.materials.renameError
      toast.error(errMsg)
    }
  }

  const currentName = item?.fileName || item?.folderName || item?.name || ""

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <PillButton onClick={onClose} variant="secondary">
        {t.materials.cancel}
      </PillButton>
      <PillButton
        onClick={handleRename}
        loading={isRenaming}
        disabled={!name.trim() || name.trim() === currentName}
      >
        {t.materials.saveChanges}
      </PillButton>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.materials.rename}
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={footer}
    >
      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.materials.enterNewName}
      />
    </Modal>
  )
}

export default RenameMaterialModal
