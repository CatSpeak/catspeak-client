import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  UserPlus,
  Trash2,
  Crown,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import Popover from "@/shared/components/ui/Popover"
import { IconButton } from "@/shared/components/ui/buttons"
import MenuList from "@/shared/components/ui/MenuList"
import MenuItem from "@/shared/components/ui/MenuItem"
import {
  usePromoteParticipantMutation,
  useDemoteParticipantMutation,
  useGetConversationMembersQuery,
} from "@/store/api/social/conversationsApi"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getProfilePath } from "@/shared/utils/navigation"
import toast from "react-hot-toast"

/**
 * GroupMemberList — Renders group participants grouped by role sections (Discord style:
 * OWNER, ADMINS, MEMBERS) and provides role-based actions (Promote, Demote, Transfer, Remove).
 */
const GroupMemberList = ({
  participants = [],
  currentUserId,
  conversation,
  onSelectMember,
  onRemoveMember,
  onOpenAddModal,
  onOpenTransferModal,
  hideHeader = false,
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
  const isCurrentUserAdmin = Boolean(
    !isCurrentUserOwner && currentMember?.isAdmin,
  )

  const handlePromote = async (participant) => {
    try {
      await promoteParticipant({
        conversationId,
        accountId: participant.accountId || participant.id,
      }).unwrap()
      toast.success(
        t?.chat?.promotedSuccess || `Promoted ${participant.username} to Admin`,
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
        t?.chat?.demotedSuccess || `Demoted ${participant.username} to Member`,
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

  // Group members by role into Discord-style sections
  const sections = useMemo(() => {
    const owners = []
    const admins = []
    const regulars = []

    for (const p of members) {
      const pId = p.accountId
      const isOwner = Boolean(p.isOwner ?? (ownerId && pId === ownerId))
      const isAdmin = Boolean(!isOwner && p.isAdmin)

      if (isOwner) {
        owners.push(p)
      } else if (isAdmin) {
        admins.push(p)
      } else {
        regulars.push(p)
      }
    }

    const list = []
    if (owners.length > 0) {
      list.push({
        id: "owner",
        title: t?.chat?.owner || "Owner",
        items: owners,
      })
    }
    if (admins.length > 0) {
      list.push({
        id: "admins",
        title: t?.chat?.admins || "Admins",
        items: admins,
      })
    }
    if (regulars.length > 0) {
      list.push({
        id: "members",
        title: t?.chat?.userPanel?.members || "Members",
        items: regulars,
      })
    }
    return list
  }, [members, ownerId, t])

  const renderMemberRow = (participant) => {
    const pId = participant.accountId
    const isMe = pId === myId
    const theme = getParticipantTheme(pId || participant.username || "")

    const isOwner = Boolean(participant.isOwner ?? (ownerId && pId === ownerId))
    const isAdmin = Boolean(!isOwner && participant.isAdmin)
    const isRegularMember = !isOwner && !isAdmin

    const canManage =
      !isMe && (isCurrentUserOwner || (isCurrentUserAdmin && isRegularMember))

    const handleMemberClick = () => {
      if (onSelectMember) {
        onSelectMember(participant)
      } else if (pId) {
        navigate(getProfilePath(pId))
      }
    }

    return (
      <ListItem
        key={pId}
        as="div"
        onClick={handleMemberClick}
        hoverEffect={true}
        lines={2}
        className="cursor-pointer group"
        leftContent={
          <Avatar
            size={40}
            name={participant.username}
            src={participant.avatarImageUrl}
            accountId={pId}
            clickable={false}
            className={theme.avatarClass}
          />
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
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Member management options"
                  >
                    <MoreVertical />
                  </IconButton>
                }
                content={({ close }) => (
                  <MenuList className="w-52 py-1 shadow-xl">
                    {isCurrentUserOwner && (
                      <>
                        {isAdmin ? (
                          <MenuItem
                            icon={<ShieldAlert className="shrink-0" />}
                            label={t?.chat?.demoteAdmin || "Demote to Member"}
                            disabled={isDemoting}
                            onClick={() => {
                              close?.()
                              handleDemote(participant)
                            }}
                          />
                        ) : (
                          <MenuItem
                            icon={<ShieldCheck className="shrink-0" />}
                            label={t?.chat?.promoteAdmin || "Promote to Admin"}
                            disabled={isPromoting}
                            onClick={() => {
                              close?.()
                              handlePromote(participant)
                            }}
                          />
                        )}

                        <MenuItem
                          icon={<Crown className="shrink-0" />}
                          label={
                            t?.chat?.transferOwnership || "Transfer Ownership"
                          }
                          onClick={() => {
                            close?.()
                            onOpenTransferModal?.(participant)
                          }}
                        />

                        <div className="my-1 border-t border-border" />
                      </>
                    )}

                    <MenuItem
                      icon={<Trash2 className="text-red-600 shrink-0" />}
                      label={
                        <span className="text-red-600">
                          {t?.chat?.userPanel?.removeTitle ||
                            "Remove from group"}
                        </span>
                      }
                      hoverBg="hover:bg-red-50 group-hover:bg-red-50"
                      onClick={() => {
                        close?.()
                        onRemoveMember?.(pId)
                      }}
                    />
                  </MenuList>
                )}
              />
            </div>
          ) : null
        }
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate font-medium text-neutral-900 group-hover:text-cath-red-700 transition-colors">
            {participant.username}
            {isMe && (
              <span className="text-[#606060] font-normal">
                {" "}
                ({t?.chat?.you || "You"})
              </span>
            )}
          </span>
        </div>

        <span className="text-xs text-[#606060] truncate">
          {participant.level || t?.chat?.userPanel?.student || "Student"}
        </span>
      </ListItem>
    )
  }

  return (
    <div className="flex-1 pb-4">
      {!hideHeader && (
        <div className="px-4 mb-2">
          <h4 className="text-sm font-semibold text-[#606060]">
            {t?.chat?.userPanel?.members || "Members"} ({members.length})
          </h4>
        </div>
      )}

      {/* Add member button as a list item at the top */}
      <ListItem
        onClick={onOpenAddModal}
        hoverEffect={true}
        lines={2}
        leftContent={
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#990011] text-white shrink-0">
            <UserPlus />
          </div>
        }
      >
        <span>{t?.chat?.userPanel?.addMembers || "Add members"}</span>
        <span className="text-sm text-[#606060]">
          {t?.chat?.userPanel?.inviteFriends || "Invite friends to this group"}
        </span>
      </ListItem>

      {/* Discord-style role sections */}
      {sections.map((section) => (
        <div key={section.id} className="mt-4">
          <div className="px-4 mb-1 select-none">
            <h5 className="text-xs text-[#606060]">
              {section.title} - {section.items.length}
            </h5>
          </div>

          <div>
            {section.items.map((participant) => renderMemberRow(participant))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GroupMemberList
