import { memo, useMemo, useState } from "react"
import { X, LogOut, ArrowLeft } from "lucide-react"
import GroupAvatar from "./GroupAvatar"
import { useRemoveParticipantMutation } from "@/store/api/social/conversationsApi"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import Drawer from "@/shared/components/ui/Drawer"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import AddMembersModal from "./modals/AddMembersModal"
import MemberProfileView from "./MemberProfileView"
import GroupMemberList from "./GroupMemberList"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ChatUserPanel — toggleable right-side info panel.
 */
const ChatUserPanel = ({
  conversation,
  currentUser,
  onClose,
  onLeaveGroup,
  friendOnlineStatus,
  isDrawer = false,
}) => {
  const { t } = useLanguage()
  const [removeParticipant] = useRemoveParticipantMutation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  const [prevConversationId, setPrevConversationId] = useState(conversation?.id)
  if (conversation?.id !== prevConversationId) {
    setPrevConversationId(conversation?.id)
    setSelectedMember(null)
  }

  // Filter friends that are not already members of this group
  const groupParticipantIds = useMemo(() => {
    return (conversation?.participants || []).map((p) => p.accountId)
  }, [conversation?.participants])

  if (!conversation) return null

  const isGroup = conversation.isGroup
  const otherUser = conversation.friend
  const name = conversation.name
  const memberCount = conversation.participants?.length || 0
  const statusText = isGroup
    ? (t?.chat?.memberCount ? t.chat.memberCount.replace("{{count}}", memberCount) : `${memberCount} members`)
    : null

  // Check if current user is group creator
  const isCreator = conversation.createdById === currentUser.id

  const handleLeaveGroup = async () => {
    try {
      await removeParticipant({
        conversationId: conversation.id,
        accountId: currentUser.id,
      }).unwrap()
      if (onLeaveGroup) {
        onLeaveGroup()
      } else {
        onClose()
      }
    } catch (err) {
      console.error("Failed to leave group:", err)
    }
  }

  const handleRemoveMember = async (accountId) => {
    try {
      await removeParticipant({
        conversationId: conversation.id,
        accountId,
      }).unwrap()
    } catch (err) {
      console.error("Failed to remove member:", err)
    }
  }

  const Container = isDrawer ? Drawer : FluentCard
  const containerClasses = isDrawer
    ? "w-[80vw] sm:w-[360px] h-full flex flex-col border-l border-t-0 border-b-0 border-r-0 shrink-0 overflow-hidden"
    : "w-[340px] h-full flex flex-col justify-start shrink-0 overflow-hidden !border-0 !rounded-none lg:!border lg:!rounded-xl"

  return (
    <Container padding="p-0" className={containerClasses}>
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[72px] border-b border-[#E5E5E5] shrink-0">
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
                  className={
                    getParticipantTheme(
                      otherUser?.accountId || otherUser?.username || "",
                    ).avatarClass
                  }
                />
              )}

              <h2 className="mt-3 font-semibold text-center">{name}</h2>
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
                participants={conversation.participants}
                currentUserId={currentUser.id}
                isCreator={isCreator}
                onSelectMember={setSelectedMember}
                onRemoveMember={handleRemoveMember}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {/* ── Danger zone ────────────────────────── */}
            {isGroup && (
              <div className="p-4">
                <PillButton
                  onClick={handleLeaveGroup}
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
    </Container>
  )
}

export default memo(ChatUserPanel)
