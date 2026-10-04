import React, { useState, useRef, useEffect, useMemo } from "react"
import { Camera } from "lucide-react"
import GroupAvatar from "./GroupAvatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { PillButton } from "@/shared/components/ui/buttons"
import { useUpdateGroupInfoMutation } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { FluentAnimation } from "@/shared/components/ui/animations"
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
    conversation?.avatarImageUrl || conversation?.groupAvatar || "",
  )
  const [avatarPreview, setAvatarPreview] = useState(
    conversation?.avatarImageUrl || conversation?.groupAvatar || "",
  )
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  const [prevId, setPrevId] = useState(conversation?.id)
  if (conversation?.id !== prevId) {
    setPrevId(conversation?.id)
    setGroupName(conversation?.name || conversation?.groupName || "")
    const initialAvatar =
      conversation?.avatarImageUrl || conversation?.groupAvatar || ""
    setGroupAvatar(initialAvatar)
    setAvatarPreview(initialAvatar)
  }

  // Smooth delayed focus so panel slide animation is not interrupted by browser focus scroll jump
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  const previewConversation = useMemo(
    () => ({
      ...conversation,
      name: groupName,
      groupName,
      avatarImageUrl: avatarPreview,
      groupAvatar: avatarPreview,
    }),
    [conversation, groupName, avatarPreview],
  )

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
    <FluentAnimation
      direction="up"
      distance={16}
      duration={0.25}
      className="h-full"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full p-4 justify-between"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Avatar Upload Preview using GroupAvatar for consistency */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative group cursor-pointer rounded-full"
              onClick={() => fileInputRef.current?.click()}
              title={
                t?.chat?.clickToChangeAvatar || "Click to change group avatar"
              }
            >
              <div className="rounded-full ring-2 ring-transparent group-hover:ring-primary/40 transition-all overflow-hidden">
                <GroupAvatar conversation={previewConversation} size={96} />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                {t?.chat?.clickToChangeAvatar || "Change group photo"}
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview("")
                    setGroupAvatar("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="text-xs text-red-500 font-medium hover:underline cursor-pointer"
                >
                  {t?.chat?.removePhoto || "Remove photo"}
                </button>
              )}
            </div>
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
        </div>

        {/* Action buttons at bottom */}
        <div className="flex items-center gap-2 mt-auto">
          {onCancel && (
            <PillButton
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {t?.chat?.cancel || "Cancel"}
            </PillButton>
          )}
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
    </FluentAnimation>
  )
}

export default EditGroupView
