import React, { useState, useRef, useEffect } from "react"
import { Camera } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useUpdateGroupInfoMutation } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * EditGroupView — Full panel sub-view allowing Owner or Admin to update group name and group avatar.
 */
const EditGroupView = ({ conversation, onSaved, onCancel }) => {
  const { t } = useLanguage()
  const [updateGroupInfo, { isLoading }] = useUpdateGroupInfoMutation()

  const [groupName, setGroupName] = useState(
    conversation?.name || conversation?.groupName || "",
  )
  const [groupAvatar, setGroupAvatar] = useState(
    conversation?.avatarImageUrl || "",
  )
  const [avatarPreview, setAvatarPreview] = useState(
    conversation?.avatarImageUrl || "",
  )
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (conversation) {
      setGroupName(conversation?.name || conversation?.groupName || "")
      setGroupAvatar(conversation?.avatarImageUrl || "")
      setAvatarPreview(conversation?.avatarImageUrl || "")
    }
  }, [conversation?.id, conversation?.name, conversation?.avatarImageUrl])

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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full p-4 justify-between"
    >
      <div className="flex flex-col items-center gap-6 pt-2">
        {/* Avatar Upload Preview */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            title={
              t?.chat?.clickToChangeAvatar || "Click to change group avatar"
            }
          >
            <Avatar
              size={96}
              name={groupName || conversation?.name}
              src={avatarPreview}
              className="border-2 border-border shadow-sm ring-2 ring-primary/20 transition-all group-hover:ring-primary/50"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={28} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary font-medium hover:underline cursor-pointer"
          >
            {t?.chat?.clickToChangeAvatar || "Change group photo"}
          </button>
        </div>

        {/* Group Name Field */}
        <div className="w-full">
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
      </div>

      {/* Action buttons at bottom */}
      <div className="flex mt-auto">
        <PillButton
          type="submit"
          variant="primary"
          disabled={isLoading || !groupName.trim()}
          className="flex-1"
        >
          {isLoading
            ? t?.chat?.saving || "Saving..."
            : t?.chat?.saveChanges || "Save Changes"}
        </PillButton>
      </div>
    </form>
  )
}

export default EditGroupView
