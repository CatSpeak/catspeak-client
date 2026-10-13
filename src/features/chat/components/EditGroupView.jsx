import React, { useState, useRef, useEffect } from "react"
import GroupAvatar from "./GroupAvatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useUpdateGroupInfoMutation } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * EditGroupView — Sub-view allowing Owner or Admin to update group name.
 */
const EditGroupView = ({ conversation, onSaved }) => {
  const { t } = useLanguage()
  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation()

  const [groupName, setGroupName] = useState(
    conversation?.name || conversation?.groupName || "",
  )
  const inputRef = useRef(null)

  const [prevId, setPrevId] = useState(conversation?.id)
  if (conversation?.id !== prevId) {
    setPrevId(conversation?.id)
    setGroupName(conversation?.name || conversation?.groupName || "")
  }

  // Smooth delayed focus so panel slide animation is not interrupted by browser focus scroll jump
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 250)
    return () => clearTimeout(timer)
  }, [])

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
        t?.chat?.groupUpdatedSuccess || "Group info updated successfully",
      )
      if (onSaved) onSaved()
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
    <div className="h-full px-4">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex flex-col items-center gap-6">
          {/* Group Avatar consistent with ChatUserPanel */}
          <div className="flex flex-col items-center">
            <GroupAvatar conversation={conversation} size={84} />
          </div>

          {/* Group Name Field */}
          <div className="w-full">
            <TextInput
              ref={inputRef}
              label={t?.chat?.groupName || "Group Name"}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t?.chat?.enterGroupName || "Enter group name"}
              required
              variant="square"
            />
          </div>

          {/* Primary Save Action */}
          <div className="w-full">
            <PillButton
              type="submit"
              variant="primary"
              disabled={isLoading || !groupName.trim()}
              className="w-full"
            >
              {isLoading
                ? t?.chat?.saving || "Saving..."
                : t?.chat?.saveChanges || "Save Changes"}
            </PillButton>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditGroupView
