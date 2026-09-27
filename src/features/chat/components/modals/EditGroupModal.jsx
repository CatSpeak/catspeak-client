import { useState, useRef } from "react"
import { Camera } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useUpdateGroupInfoMutation } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * EditGroupModal — Allows Owner or Admin to update group name and group avatar.
 */
const EditGroupModal = ({ open, onClose, conversation }) => {
  const { t } = useLanguage()
  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation()

  const [groupName, setGroupName] = useState("")
  const [groupAvatar, setGroupAvatar] = useState("")
  const [avatarPreview, setAvatarPreview] = useState("")
  const fileInputRef = useRef(null)

  const [prevKey, setPrevKey] = useState({ id: conversation?.id, open })
  if (conversation?.id !== prevKey.id || open !== prevKey.open) {
    setPrevKey({ id: conversation?.id, open })
    if (open && conversation) {
      setGroupName(conversation.name || "")
      setGroupAvatar(conversation.avatarImageUrl || "")
      setAvatarPreview(conversation.avatarImageUrl || "")
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error(t?.chat?.imageOnlyPrompt || "Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      setAvatarPreview(base64)
      setGroupAvatar(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const trimmedName = groupName.trim()
    if (!trimmedName) {
      toast.error(t?.chat?.groupNameRequired || "Group name cannot be empty")
      return
    }

    try {
      await updateGroupInfo({
        conversationId: conversation.id,
        groupName: trimmedName,
        groupAvatar: groupAvatar || undefined,
      }).unwrap()

      toast.success(t?.chat?.groupUpdatedSuccess || "Group info updated successfully")
      onClose()
    } catch (err) {
      console.error("Failed to update group info:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.groupUpdateFailed ||
          "Failed to update group info",
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.chat?.editGroupTitle || "Edit Group"}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-6">
        {/* Avatar Upload Preview */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar
              size={88}
              name={groupName || conversation?.name}
              src={avatarPreview}
              className="border-2 border-border shadow-sm ring-2 ring-primary/20"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={26} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-xs text-neutral-500">
            {t?.chat?.clickToChangeAvatar || "Click to change group avatar"}
          </p>
        </div>

        {/* Group Name Field */}
        <div>
          <TextInput
            label={t?.chat?.groupName || "Group Name"}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t?.chat?.enterGroupName || "Enter group name"}
            required
            autoFocus
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <PillButton
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {t?.chat?.cancel || "Cancel"}
          </PillButton>
          <PillButton
            type="submit"
            variant="primary"
            disabled={isLoading || !groupName.trim()}
          >
            {isLoading
              ? t?.chat?.saving || "Saving..."
              : t?.chat?.saveChanges || "Save Changes"}
          </PillButton>
        </div>
      </form>
    </Modal>
  )
}

export default EditGroupModal
