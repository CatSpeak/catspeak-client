import { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useUpdateGroupInfoMutation } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * EditGroupModal — Modal allowing Owner or Admin to update group name.
 */
const EditGroupModal = ({ open, onClose, conversation }) => {
  const { t } = useLanguage()
  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation()

  const [groupName, setGroupName] = useState("")

  const [prevKey, setPrevKey] = useState({ id: conversation?.id, open })
  if (conversation?.id !== prevKey.id || open !== prevKey.open) {
    setPrevKey({ id: conversation?.id, open })
    if (open && conversation) {
      setGroupName(conversation.name || conversation.groupName || "")
    }
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
        groupAvatar: conversation?.avatarImageUrl || undefined,
      }).unwrap()

      toast.success(
        t?.chat?.groupUpdatedSuccess || "Group name updated successfully",
      )
      onClose()
    } catch (err) {
      console.error("Failed to update group info:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.groupUpdateFailed ||
          "Failed to update group name",
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.chat?.changeGroupName || "Change Group Name"}
      className="rounded-xl border border-border"
      fullScreenOnMobile={false}
      headerClassName="flex items-center justify-between p-4"
      bodyClassName="px-4 flex-1"
      footerClassName="p-4 flex justify-end"
      maxWidth="max-w-md"
      footer={
        <PillButton
          type="submit"
          form="edit-group-name-form"
          onClick={handleSubmit}
          variant="primary"
          disabled={isLoading || !groupName.trim()}
        >
          {isLoading
            ? t?.chat?.saving || "Saving..."
            : t?.chat?.saveChanges || "Save Changes"}
        </PillButton>
      }
    >
      <form
        id="edit-group-name-form"
        onSubmit={handleSubmit}
        className="flex flex-col"
      >
        {/* Group Name Field */}
        <div>
          <TextInput
            label={t?.chat?.groupName || "Group Name"}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t?.chat?.enterGroupName || "Enter group name"}
            required
            autoFocus
            variant="square"
          />
        </div>
      </form>
    </Modal>
  )
}

export default EditGroupModal
