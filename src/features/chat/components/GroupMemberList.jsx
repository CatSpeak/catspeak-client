import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  UserPlus,
  Trash2,
  Crown,
  Star,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import Popover from "@/shared/components/ui/Popover"
import {
  usePromoteParticipantMutation,
  useDemoteParticipantMutation,
  useGetConversationMembersQuery,
} from "@/store/api/social/conversationsApi"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * GroupMemberList — Renders group participants with role badges (👑 Owner, ⭐ Admin, Member)
 * and role-based actions (Promote, Demote, Transfer Ownership, Remove Member).
 */
const GroupMemberList = ({
  participants = [],
  currentUserId,
  conversation,
  onSelectMember,
  onRemoveMember,
  onOpenAddModal,
  onOpenTransferModal,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [promoteParticipant, { isLoading: isPromoting }] =
    usePromoteParticipantMutation()
  const [demoteParticipant, { isLoading: isDemoting }] =
    useDemoteParticipantMutation()

  const conversationId = conversation?.id
  const ownerId = conversation?.createdById
  const myId = Number(currentUserId)

  const { data: membersResponse = [] } = useGetConversationMembersQuery(
    conversationId,
    { skip: !conversationId },
  )

  const members = useMemo(() => {
    const list = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || []
    return list.length > 0 ? list : participants
  }, [membersResponse, participants])

  // Current user's member object in group
  const currentMember = useMemo(() => {
    return members.find((m) => m.accountId === myId)
  }, [members, myId])

  const isCurrentUserOwner = Boolean(
    currentMember ? currentMember.isOwner : myId === ownerId,
  )
  const isCurrentUserAdmin = Boolean(!isCurrentUserOwner && currentMember?.isAdmin)

  const handlePromote = async (participant) => {
    try {
      await promoteParticipant({
        conversationId,
        accountId: participant.accountId || participant.id,
      }).unwrap()
      toast.success(
        t?.chat?.promotedSuccess ||
          `Promoted ${participant.username} to Admin`,
      )
    } catch (err) {
      console.error("Failed to promote participant:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.promoteFailed ||
          "Failed to promote participant",
      )
    }
  }

  const handleDemote = async (participant) => {
    try {
      await demoteParticipant({
        conversationId,
        accountId: participant.accountId || participant.id,
      }).unwrap()
      toast.success(
        t?.chat?.demotedSuccess ||
          `Demoted ${participant.username} to Member`,
      )
    } catch (err) {
      console.error("Failed to demote participant:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.demoteFailed ||
          "Failed to demote participant",
      )
    }
  }

  return (
    <div>
      <div className="px-4 mb-2">
        <h4 className="text-sm font-semibold text-[#606060]">
          {t?.chat?.userPanel?.members || "Members"} ({members.length})
        </h4>
      </div>

      <div>
        {/* Add member button as a list item at the top */}
        <ListItem
          onClick={onOpenAddModal}
          hoverEffect={true}
          lines={2}
          leftContent={
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#990011] text-white shrink-0 shadow-sm">
              <UserPlus size={20} />
            </div>
          }
        >
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
            {t?.chat?.userPanel?.addMembers || "Add members"}
          </span>
          <span className="text-sm text-[#606060]">
            {t?.chat?.userPanel?.inviteFriends || "Invite friends to this group"}
          </span>
        </ListItem>

        {members.map((participant) => {
          const pId = participant.accountId
          const isMe = pId === myId
          const theme = getParticipantTheme(pId || participant.username || "")

          const isOwner = Boolean(
            participant.isOwner ?? (ownerId && pId === ownerId),
          )
          const isAdmin = Boolean(!isOwner && participant.isAdmin)
          const isRegularMember = !isOwner && !isAdmin

          const canManage =
            !isMe &&
            (isCurrentUserOwner || (isCurrentUserAdmin && isRegularMember))

          return (
            <ListItem
              key={pId}
              as="div"
              onClick={() => onSelectMember(participant)}
              hoverEffect={true}
              lines={2}
              leftContent={
                <div className="relative shrink-0">
                  <Avatar
                    size={40}
                    name={participant.username}
                    src={participant.avatarImageUrl}
                    accountId={pId}
                    className={theme.avatarClass}
                  />
                  {/* Avatar Mini Badge */}
                  {isOwner ? (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs"
                      title={t?.chat?.ownerBadge || "Group Owner"}
                    >
                      <Crown size={10} className="fill-white" />
                    </span>
                  ) : isAdmin ? (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs"
                      title={t?.chat?.adminBadge || "Group Admin"}
                    >
                      <Star size={10} className="fill-white" />
                    </span>
                  ) : null}
                </div>
              }
              rightContent={
                canManage ? (
                  <div
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Popover
                      placement="bottom-right"
                      trigger={
                        <button
                          type="button"
                          className="flex items-center justify-center h-8 w-8 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                          aria-label="Member management options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      }
                      content={({ close }) => (
                        <div className="w-48 py-1 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-border divide-y divide-border/40 text-xs">
                          {isCurrentUserOwner && (
                            <div className="py-1">
                              {isAdmin ? (
                                <button
                                  type="button"
                                  disabled={isDemoting}
                                  onClick={() => {
                                    close?.()
                                    handleDemote(participant)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-zinc-700/60 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                                >
                                  <ShieldAlert size={14} className="text-amber-500 shrink-0" />
                                  <span>{t?.chat?.demoteAdmin || "Demote to Member"}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isPromoting}
                                  onClick={() => {
                                    close?.()
                                    handlePromote(participant)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-zinc-700/60 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                                >
                                  <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                                  <span>{t?.chat?.promoteAdmin || "Promote to Admin"}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  close?.()
                                  onOpenTransferModal?.(participant)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-zinc-700/60 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                              >
                                <Crown size={14} className="text-amber-500 shrink-0" />
                                <span>{t?.chat?.transferOwnership || "Transfer Ownership"}</span>
                              </button>
                            </div>
                          )}

                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                close?.()
                                onRemoveMember?.(pId)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                            >
                              <Trash2 size={14} className="shrink-0" />
                              <span>{t?.chat?.userPanel?.removeTitle || "Remove from group"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                ) : null
              }
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  onClick={(e) => {
                    if (pId) {
                      e.stopPropagation()
                      navigate(`/profile/${pId}`)
                    }
                  }}
                  className={`truncate font-medium text-neutral-900 dark:text-neutral-100 ${
                    pId
                      ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors"
                      : ""
                  }`}
                >
                  {participant.username}
                  {isMe && (
                    <span className="text-[#606060] font-normal">
                      {" "}
                      ({t?.chat?.you || "You"})
                    </span>
                  )}
                </span>

                {/* Inline Role Badge */}
                {isOwner && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                    <Crown size={9} className="fill-amber-500" />
                    <span>{t?.chat?.owner || "Owner"}</span>
                  </span>
                )}
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
                    <Star size={9} className="fill-blue-500" />
                    <span>{t?.chat?.admin || "Admin"}</span>
                  </span>
                )}
              </div>

              <span className="text-xs text-[#606060] truncate">
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
