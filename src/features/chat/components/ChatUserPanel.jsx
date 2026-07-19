import { memo, useMemo, useState } from "react"
import { X, Users, LogOut, UserPlus, Trash2, ArrowLeft } from "lucide-react"
import GroupAvatar from "./GroupAvatar"
import { useRemoveParticipantMutation } from "@/store/api/social/conversationsApi"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import Drawer from "@/shared/components/ui/Drawer"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import ListItem from "@/shared/components/ui/ListItem"
import AddMembersModal from "./AddMembersModal"

/**
 * ChatUserPanel — toggleable right-side info panel.
 */
const ChatUserPanel = ({
  conversation,
  currentUser,
  onClose,
  friendOnlineStatus,
  isDrawer = false,
}) => {
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
  const isOnline = !isGroup && !!friendOnlineStatus[otherUser?.accountId]

  // Check if current user is group creator
  const isCreator = conversation.createdById === currentUser.id

  const statusText = isGroup
    ? `${memberCount} members`
    : isOnline
      ? "Active now"
      : "Offline"

  const handleLeaveGroup = async () => {
    try {
      await removeParticipant({
        conversationId: conversation.id,
        accountId: currentUser.id,
      }).unwrap()
      onClose()
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
              ? "Member Profile"
              : isGroup
                ? "Group Info"
                : "Profile"}
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
          <div className="flex flex-col items-center p-4">
            <Avatar
              size={80}
              name={selectedMember.username}
              src={selectedMember.avatarImageUrl}
              className={
                getParticipantTheme(
                  selectedMember.accountId || selectedMember.username || "",
                ).avatarClass
              }
            />

            <h2 className="mt-3 font-semibold text-center">
              {selectedMember.username}
            </h2>
            <p className="text-xs text-[#606060] flex items-center gap-1.5 justify-center">
              {!!friendOnlineStatus[selectedMember.accountId] && (
                <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
              )}
              {friendOnlineStatus[selectedMember.accountId]
                ? "Active now"
                : "Offline"}
            </p>

            <p className="mt-4 text-sm text-[#606060] text-center">
              Level: {selectedMember.level || "Student"}
            </p>

            <div className="w-full mt-6">
              <PillButton
                onClick={() =>
                  window.open(`/profile/${selectedMember.accountId}`, "_blank")
                }
                variant="primary"
                className="w-full"
              >
                View Profile
              </PillButton>
            </div>
          </div>
        ) : (
          <>
            {/* Profile section */}
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
              <p className="text-xs text-[#606060] flex items-center gap-1.5">
                {!isGroup && isOnline && (
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" />
                )}
                {statusText}
              </p>

              {!isGroup && otherUser?.level && (
                <p className="mt-3 text-[13px] text-[#606060] text-center leading-relaxed">
                  Level: {otherUser.level}
                </p>
              )}
            </div>

            {/* ── Group members ──────────────────────── */}
            {isGroup && (
              <div>
                <div className="px-4 mb-2">
                  <h4 className="text-sm font-semibold text-[#606060]">
                    Members
                  </h4>
                </div>

                <div>
                  {/* Add member button as a list item at the top of the stack */}
                  <ListItem
                    onClick={() => setIsAddModalOpen(true)}
                    hoverEffect={true}
                    lines={2}
                    leftContent={
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#990011] text-white shrink-0">
                        <UserPlus size={20} />
                      </div>
                    }
                  >
                    <span>Add members</span>
                    <span className="text-sm text-[#606060]">
                      Invite friends to this group
                    </span>
                  </ListItem>

                  {conversation.participants?.map((participant) => {
                    const isMe = participant.accountId === currentUser.id
                    const isOnline = !!friendOnlineStatus[participant.accountId]
                    const theme = getParticipantTheme(
                      participant.accountId || participant.username || "",
                    )
                    return (
                      <ListItem
                        key={participant.accountId}
                        onClick={() => setSelectedMember(participant)}
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
                            {isOnline && (
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#22C55E]" />
                            )}
                          </div>
                        }
                        rightContent={
                          isCreator &&
                          !isMe && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveMember(participant.accountId)
                              }}
                              className="opacity-0 group-hover:opacity-100 flex items-center justify-center h-7 w-7 text-red-500 hover:bg-red-50 rounded-full transition-all duration-150"
                              title="Remove from group"
                            >
                              <Trash2 size={14} />
                            </button>
                          )
                        }
                      >
                        <span className="truncate">
                          {participant.username}
                          {isMe && (
                            <span className="text-[#606060]"> (You)</span>
                          )}
                        </span>
                        <span className="text-sm text-[#606060] truncate">
                          {participant.level || "Student"}
                        </span>
                      </ListItem>
                    )
                  })}
                </div>
              </div>
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
                  Leave group
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
