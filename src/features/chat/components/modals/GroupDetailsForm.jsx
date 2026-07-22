import React from "react"
import { ArrowLeft, Trash2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import ListItem from "@/shared/components/ui/ListItem"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

const GroupDetailsForm = ({
  groupName,
  setGroupName,
  selectedFriendsData = [],
  onRemoveFriend,
  onCreateGroup,
  onBack,
  isLoading,
}) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <IconButton
          onClick={onBack}
          size="sm"
          variant="ghost"
          aria-label="Back to member selection"
        >
          <ArrowLeft />
        </IconButton>
        <span className="font-semibold">{t?.chat?.modals?.groupDetailsTitle || "Group details"}</span>
      </div>

      {/* Group Name Input */}
      <div className="px-4 pb-6">
        <TextInput
          label={t?.chat?.modals?.groupNameLabel || "Group Name"}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          floatingLabel
          variant="square"
          autoFocus
        />
      </div>

      {/* Selected Friends Preview */}
      <div className="px-4 flex-1 overflow-hidden flex flex-col min-h-0">
        <span className="text-xs text-[#606060] mb-2">
          {t?.chat?.modals?.selectedCount
            ? t.chat.modals.selectedCount.replace("{{count}}", selectedFriendsData.length)
            : `${selectedFriendsData.length} members selected`}
        </span>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pb-4">
          {selectedFriendsData.map((friend) => {
            const theme = getParticipantTheme(
              friend.accountId || friend.username || "",
            )
            return (
              <ListItem
                key={friend.accountId}
                hoverEffect={false}
                className="overflow-hidden shrink-0"
                contentClassName="rounded-xl px-0"
                lines={2}
                leftContent={
                  <Avatar
                    src={friend.avatarImageUrl}
                    name={friend.nickname || friend.username}
                    size={40}
                    className={theme.avatarClass}
                  />
                }
                rightContent={
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveFriend(friend.accountId)
                    }}
                    size="sm"
                    variant="transparent"
                    className="text-[#606060] hover:text-[#990011] hover:bg-[#E5E5E5] rounded-full shrink-0"
                    aria-label={`Remove ${friend.nickname || friend.username}`}
                  >
                    <Trash2 />
                  </IconButton>
                }
              >
                <p className="font-medium text-black">
                  {friend.nickname || friend.username}
                </p>
                <p className="text-sm text-[#606060]">
                  {friend.level || t?.chat?.userPanel?.student || "Student"}
                </p>
              </ListItem>
            )
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#E5E5E5] flex justify-end gap-2 p-4 shrink-0">
        <PillButton onClick={onBack} variant="secondary-no-outline">
          {t?.chat?.modals?.back || "Back"}
        </PillButton>
        <PillButton
          onClick={onCreateGroup}
          disabled={
            !groupName.trim() || selectedFriendsData.length === 0 || isLoading
          }
          loading={isLoading}
        >
          {t?.chat?.modals?.createGroup || "Create Group"}
        </PillButton>
      </div>
    </div>
  )
}

export default GroupDetailsForm
