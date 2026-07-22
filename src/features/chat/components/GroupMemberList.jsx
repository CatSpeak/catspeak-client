import { UserPlus, Trash2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * GroupMemberList — renders group participant items with creator removal capabilities and add member button.
 */
const GroupMemberList = ({
  participants = [],
  currentUserId,
  isCreator,
  onSelectMember,
  onRemoveMember,
  onOpenAddModal,
}) => {
  const { t } = useLanguage()

  return (
    <div>
      <div className="px-4 mb-2">
        <h4 className="text-sm font-semibold text-[#606060]">
          {t?.chat?.userPanel?.members || "Members"}
        </h4>
      </div>

      <div>
        {/* Add member button as a list item at the top of the stack */}
        <ListItem
          onClick={onOpenAddModal}
          hoverEffect={true}
          lines={2}
          leftContent={
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#990011] text-white shrink-0">
              <UserPlus size={20} />
            </div>
          }
        >
          <span>{t?.chat?.userPanel?.addMembers || "Add members"}</span>
          <span className="text-sm text-[#606060]">
            {t?.chat?.userPanel?.inviteFriends || "Invite friends to this group"}
          </span>
        </ListItem>

        {participants.map((participant) => {
          const isMe = participant.accountId === currentUserId
          const theme = getParticipantTheme(
            participant.accountId || participant.username || "",
          )
          return (
            <ListItem
              key={participant.accountId}
              onClick={() => onSelectMember(participant)}
              hoverEffect={true}
              lines={2}
              leftContent={
                <div className="relative shrink-0">
                  <Avatar
                    size={40}
                    name={participant.username}
                    src={participant.avatarImageUrl}
                    className={theme.avatarClass}
                  />
                </div>
              }
              rightContent={
                isCreator &&
                !isMe && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveMember(participant.accountId)
                    }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-7 w-7 text-red-500 hover:bg-red-50 rounded-full transition-all duration-150"
                    title={t?.chat?.userPanel?.removeTitle || "Remove from group"}
                  >
                    <Trash2 size={14} />
                  </button>
                )
              }
            >
              <span className="truncate">
                {participant.username}
                {isMe && <span className="text-[#606060]"> ({t?.chat?.you || "You"})</span>}
              </span>
              <span className="text-sm text-[#606060] truncate">
                {participant.level || t?.chat?.userPanel?.student || "Student"}
              </span>
            </ListItem>
          )
        })}
      </div>
    </div>
  )
}

export default GroupMemberList
