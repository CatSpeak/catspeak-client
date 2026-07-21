import { Users } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import ListItem from "@/shared/components/ui/ListItem"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

const GroupMemberSelector = ({
  friends = [],
  selectedFriends = [],
  onToggleFriend,
  searchQuery,
  onSearchChange,
  onNext,
  onClose,
}) => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search bar */}
      <div className="px-4 pb-4">
        <SearchInput
          placeholder={t?.chat?.modals?.searchFriends || "Search friends..."}
          value={searchQuery}
          onChange={onSearchChange}
          className="min-w-0"
        />
      </div>

      {/* Friends checklist */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-4 pb-4">
        {friends.length === 0 ? (
          <EmptyState
            variant="component"
            icon={Users}
            message={t?.chat?.modals?.noFriendsFound || "No friends found"}
          />
        ) : (
          friends.map((friend) => {
            const isChecked = selectedFriends.includes(friend.accountId)
            const theme = getParticipantTheme(
              friend.accountId || friend.username || "",
            )
            return (
              <ListItem
                key={friend.accountId}
                onClick={() => onToggleFriend(friend.accountId)}
                hoverEffect={true}
                className="overflow-hidden cursor-pointer shrink-0"
                contentClassName={`rounded-xl ${isChecked ? "bg-[#F2F2F2]" : ""}`}
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
                  <Checkbox
                    checked={isChecked}
                    variant="large"
                    as="div"
                  />
                }
              >
                <p>{friend.nickname || friend.username}</p>
                <p className="text-sm text-[#606060]">
                  {friend.level || t?.chat?.userPanel?.student || "Student"}
                </p>
              </ListItem>
            )
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#E5E5E5] flex justify-end gap-2 p-4">
        <PillButton onClick={onClose} variant="secondary-no-outline">
          {t?.chat?.modals?.cancel || "Cancel"}
        </PillButton>
        <PillButton
          onClick={onNext}
          disabled={selectedFriends.length === 0}
        >
          {t?.chat?.modals?.next
            ? t.chat.modals.next.replace("{{count}}", selectedFriends.length > 0 ? `(${selectedFriends.length})` : "")
            : `Next ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ""}`}
        </PillButton>
      </div>
    </div>
  )
}

export default GroupMemberSelector
