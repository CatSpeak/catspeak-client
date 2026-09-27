import { memo, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, LogOut, ArrowLeft, Edit3 } from "lucide-react"
import GroupAvatar from "./GroupAvatar"
import {
  useRemoveParticipantMutation,
  useLeaveGroupMutation,
  useGetConversationMembersQuery,
} from "@/store/api/social/conversationsApi"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import Drawer from "@/shared/components/ui/Drawer"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import AddMembersModal from "./modals/AddMembersModal"
import EditGroupModal from "./modals/EditGroupModal"
import TransferOwnershipModal from "./modals/TransferOwnershipModal"
import MemberProfileView from "./MemberProfileView"
import GroupMemberList from "./GroupMemberList"
import SharedMediaGallery from "./gallery/SharedMediaGallery"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getProfilePath } from "@/shared/utils/navigation"
import toast from "react-hot-toast"

/**
 * ChatUserPanel — toggleable right-side info panel.
 */
const ChatUserPanel = ({
  conversation,
  currentUser,
  onClose,
  onLeaveGroup,
  isDrawer = false,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [removeParticipant] = useRemoveParticipantMutation()
  const [leaveGroupMutation, { isLoading: isLeaving }] = useLeaveGroupMutation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  const [prevConversationId, setPrevConversationId] = useState(conversation?.id)
  if (conversation?.id !== prevConversationId) {
    setPrevConversationId(conversation?.id)
    setSelectedMember(null)
  }

  const isGroup = conversation?.isGroup

  const { data: membersResponse = [] } = useGetConversationMembersQuery(
    conversation?.id,
    { skip: !conversation?.id || !isGroup },
  )

  const groupMembers = useMemo(() => {
    const list = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || []
    return list.length > 0 ? list : conversation?.participants || []
  }, [membersResponse, conversation?.participants])

  // Filter friends that are not already members of this group
  const groupParticipantIds = useMemo(() => {
    return groupMembers.map((p) => p.accountId)
  }, [groupMembers])

  const currentMember = useMemo(() => {
    return groupMembers.find((p) => p.accountId === currentUser?.id)
  }, [groupMembers, currentUser?.id])

  if (!conversation) return null

  const otherUser = conversation.friend
  const friendId = otherUser?.accountId || otherUser?.id || conversation?.friendId
  const name = conversation.name
  const memberCount = groupMembers.length || conversation.participants?.length || 0
  const statusText = isGroup
    ? (t?.chat?.memberCount ? t.chat.memberCount.replace("{{count}}", memberCount) : `${memberCount} members`)
    : null

  const [transferTargetMember, setTransferTargetMember] = useState(null)

  // Group roles & permissions from single source of truth
  const isOwner = Boolean(
    currentMember ? currentMember.isOwner : currentUser?.id === conversation?.createdById,
  )
  const isAdmin = Boolean(!isOwner && currentMember?.isAdmin)
  const canEditGroup = isOwner || isAdmin

  const handleLeaveGroup = async () => {
    if (isOwner) {
      toast.error(
        t?.chat?.ownerCannotLeavePrompt ||
          "As group owner, you must transfer ownership to another member before leaving the group.",
        { duration: 4500, icon: "👑" },
      )
      setIsTransferModalOpen(true)
      return
    }

    try {
      await leaveGroupMutation(conversation.id).unwrap()
      toast.success(t?.chat?.leftGroupSuccess || "You have left the group")
      if (onLeaveGroup) {
        onLeaveGroup()
      } else {
        onClose()
      }
    } catch (err) {
      console.error("Failed to leave group:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.leaveGroupFailed ||
          "Failed to leave group",
      )
    }
  }

  const handleRemoveMember = async (accountId) => {
    try {
      await removeParticipant({
        conversationId: conversation.id,
        accountId,
      }).unwrap()
      toast.success(t?.chat?.memberRemovedSuccess || "Member removed from group")
    } catch (err) {
      console.error("Failed to remove member:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.removeMemberFailed ||
          "Failed to remove member",
      )
    }
  }

  const Container = isDrawer ? Drawer : FluentCard
  const containerClasses = isDrawer
    ? "w-[80vw] sm:w-[360px] h-full flex flex-col border-l border-t-0 border-b-0 border-r-0 shrink-0 overflow-hidden"
    : "w-[340px] h-full flex flex-col justify-start shrink-0 overflow-hidden !border-0 !rounded-none lg:!border lg:!rounded-xl"

  return (
    <Container padding="p-0" className={containerClasses}>
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[72px] border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {selectedMember && (
            <IconButton
              onClick={() => setSelectedMember(null)}
              variant="ghost"
              size="sm"
              aria-label="Go back to group info"
            >
              <ArrowLeft size={20} />
            </IconButton>
          )}
          <h3 className="font-semibold">
            {selectedMember
              ? (t?.chat?.userPanel?.memberProfile || "Member Profile")
              : isGroup
                ? (t?.chat?.userPanel?.groupInfo || "Group Info")
                : (t?.chat?.userPanel?.profile || "Profile")}
          </h3>
        </div>
        <IconButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          aria-label="Close panel"
        >
          <X />
        </IconButton>
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {selectedMember ? (
          <MemberProfileView member={selectedMember} />
        ) : (
          <>
            {/* Profile header section */}
            <div className="flex flex-col items-center p-4">
              {isGroup ? (
                <GroupAvatar conversation={conversation} size={80} />
              ) : (
                <Avatar
                  size={80}
                  name={otherUser?.username}
                  src={otherUser?.avatarImageUrl}
                  accountId={friendId}
                  className={
                    getParticipantTheme(
                      otherUser?.accountId || otherUser?.username || "",
                    ).avatarClass
                  }
                />
              )}

              {!isGroup && friendId ? (
                <h2
                  onClick={() => navigate(getProfilePath(friendId))}
                  className="mt-3 font-semibold text-center hover:underline hover:text-primary transition-colors cursor-pointer"
                >
                  {name}
                </h2>
              ) : (
                <div className="flex items-center gap-1.5 mt-3 justify-center">
                  <h2 className="font-semibold text-center">{name}</h2>
                  {isGroup && canEditGroup && (
                    <IconButton
                      onClick={() => setIsEditGroupModalOpen(true)}
                      size="xs"
                      variant="ghost"
                      aria-label="Edit group info"
                      title={t?.chat?.editGroupTitle || "Edit Group"}
                      className="text-neutral-400 hover:text-primary"
                    >
                      <Edit3 size={15} />
                    </IconButton>
                  )}
                </div>
              )}
              {statusText && (
                <p className="text-xs text-[#606060] flex items-center gap-1.5">
                  {statusText}
                </p>
              )}

              {!isGroup && otherUser?.level && (
                <p className="mt-3 text-[13px] text-[#606060] text-center leading-relaxed">
                  {t?.chat?.userPanel?.level || "Level"}: {otherUser.level}
                </p>
              )}
            </div>

            {/* ── Group members ──────────────────────── */}
            {isGroup && (
              <GroupMemberList
                participants={groupMembers}
                currentUserId={currentUser.id}
                conversation={conversation}
                onSelectMember={setSelectedMember}
                onRemoveMember={handleRemoveMember}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenTransferModal={(member) => {
                  setTransferTargetMember(member || null)
                  setIsTransferModalOpen(true)
                }}
              />
            )}

            {/* ── Shared Content Gallery (Photos, Videos, Files, Audio, Links) ── */}
            <SharedMediaGallery conversationId={conversation.id} />

            {/* ── Danger zone ────────────────────────── */}
            {isGroup && (
              <div className="p-4">
                <PillButton
                  onClick={handleLeaveGroup}
                  disabled={isLeaving}
                  variant="outline"
                  textColor="#DC2626"
                  borderColor="#FECACA"
                  startIcon={<LogOut size={16} />}
                  className="w-full"
                >
                  {t?.chat?.userPanel?.leaveGroup || "Leave group"}
                </PillButton>
              </div>
            )}
          </>
        )}
      </div>

      <AddMembersModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        conversationId={conversation.id}
        currentUser={currentUser}
        groupParticipantIds={groupParticipantIds}
      />

      <EditGroupModal
        open={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        conversation={conversation}
      />

      <TransferOwnershipModal
        open={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false)
          setTransferTargetMember(null)
        }}
        conversation={conversation}
        currentUserId={currentUser.id}
        initialTargetAccountId={
          transferTargetMember?.accountId || transferTargetMember?.id
        }
      />
    </Container>
  )
}

export default memo(ChatUserPanel)
