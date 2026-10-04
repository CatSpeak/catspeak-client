import { memo, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  X,
  LogOut,
  ArrowLeft,
  Edit3,
  Users,
  Image as ImageIcon,
  ChevronRight,
  Search,
} from "lucide-react"
import { motion as Motion, AnimatePresence } from "framer-motion"
import GroupAvatar from "./GroupAvatar"
import {
  useRemoveParticipantMutation,
  useLeaveGroupMutation,
  useGetConversationMembersQuery,
} from "@/store/api/social/conversationsApi"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import AddMembersModal from "./modals/AddMembersModal"
import TransferOwnershipModal from "./modals/TransferOwnershipModal"
import GroupMemberList from "./GroupMemberList"
import SharedMediaGallery from "./gallery/SharedMediaGallery"
import EditGroupView from "./EditGroupView"
import ChatSearchView from "./search/ChatSearchView"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getProfilePath } from "@/shared/utils/navigation"
import toast from "react-hot-toast"

const panelVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
}

const panelTransition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1],
}

/**
 * ChatUserPanel — toggleable right-side info panel with smooth drill-down navigation.
 * Views:
 *   - "main": high-level overview with 3 navigable options (Edit, Members, Media)
 *   - "edit": inline group name & avatar editor
 *   - "members": full member list with role badges and actions
 *   - "member_profile": individual member profile preview
 *   - "media": full shared media gallery with tabs
 *   - "search": in-conversation message search
 */
const ChatUserPanel = ({
  conversation,
  currentUser,
  onClose,
  onLeaveGroup,
  isDrawer = false,
  initialView = "main",
  onJumpToMessage,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [removeParticipant] = useRemoveParticipantMutation()
  const [leaveGroupMutation, { isLoading: isLeaving }] = useLeaveGroupMutation()

  const [currentView, setCurrentView] = useState(initialView || "main")
  const [direction, setDirection] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferTargetMember, setTransferTargetMember] = useState(null)

  // Sync when initialView changes externally (e.g. from ChatHeader search button)
  const [prevInitialView, setPrevInitialView] = useState(initialView)
  if (initialView !== prevInitialView) {
    setPrevInitialView(initialView)
    setCurrentView(initialView)
    setDirection(1)
  }

  const [prevConversationId, setPrevConversationId] = useState(conversation?.id)
  if (conversation?.id !== prevConversationId) {
    setPrevConversationId(conversation?.id)
    setCurrentView(initialView || "main")
  }

  const isGroup = conversation?.isGroup

  const { data: membersResponse = [] } = useGetConversationMembersQuery(
    conversation?.id,
    { skip: !conversation?.id || !isGroup },
  )

  const participants = conversation?.participants
  const groupMembers = useMemo(() => {
    const list = Array.isArray(membersResponse)
      ? membersResponse
      : membersResponse?.data || []
    return list.length > 0 ? list : participants || []
  }, [membersResponse, participants])

  // Filter friends that are not already members of this group
  const groupParticipantIds = useMemo(() => {
    return groupMembers.map((p) => p.accountId)
  }, [groupMembers])

  const currentMember = useMemo(() => {
    return groupMembers.find((p) => p.accountId === currentUser?.id)
  }, [groupMembers, currentUser?.id])

  const otherUser = conversation?.friend
  const friendId =
    otherUser?.accountId || otherUser?.id || conversation?.friendId
  const name = conversation?.name
  const memberCount = groupMembers.length || participants?.length || 0
  const statusText = isGroup
    ? t?.chat?.memberCount
      ? t.chat.memberCount.replace("{{count}}", memberCount)
      : `${memberCount} members`
    : null

  // Group roles & permissions from single source of truth
  const isOwner = Boolean(
    currentMember
      ? currentMember.isOwner
      : currentUser?.id === conversation?.createdById,
  )
  const isAdmin = Boolean(!isOwner && currentMember?.isAdmin)
  const canEditGroup = isOwner || isAdmin

  const navigateTo = (view) => {
    setDirection(1)
    setCurrentView(view)
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentView("main")
  }

  const headerTitle = useMemo(() => {
    switch (currentView) {
      case "edit":
        return t?.chat?.editGroupTitle || "Edit Group"
      case "members":
        return `${t?.chat?.userPanel?.members || "Members"} (${memberCount})`
      case "media":
        return t?.chat?.userPanel?.sharedMedia || "Media, Files & Links"
      case "search":
        return t?.chat?.userPanel?.searchMessages || "Search Messages"
      case "main":
      default:
        return isGroup
          ? t?.chat?.userPanel?.groupInfo || "Group Info"
          : t?.chat?.userPanel?.profile || "Profile"
    }
  }, [currentView, isGroup, memberCount, t])

  const navOptions = useMemo(() => {
    const options = []

    if (isGroup && canEditGroup) {
      options.push({
        id: "edit",
        icon: Edit3,
        title: t?.chat?.userPanel?.editGroup || "Edit Group",
        onClick: () => navigateTo("edit"),
      })
    }

    if (isGroup) {
      options.push({
        id: "members",
        icon: Users,
        title: t?.chat?.userPanel?.members || "Members",
        onClick: () => navigateTo("members"),
      })
    }

    options.push({
      id: "media",
      icon: ImageIcon,
      title: t?.chat?.userPanel?.sharedMedia || "Media, Files & Links",
      onClick: () => navigateTo("media"),
    })

    options.push({
      id: "search",
      icon: Search,
      title: t?.chat?.userPanel?.searchMessages || "Search Messages",
      onClick: () => navigateTo("search"),
    })

    return options
  }, [isGroup, canEditGroup, t])

  if (!conversation) return null

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
      toast.success(
        t?.chat?.memberRemovedSuccess || "Member removed from group",
      )
    } catch (err) {
      console.error("Failed to remove member:", err)
      toast.error(
        err?.data?.message ||
          t?.chat?.removeMemberFailed ||
          "Failed to remove member",
      )
    }
  }

  const containerClasses = isDrawer
    ? "w-full sm:w-[360px] h-full flex flex-col bg-white shrink-0 overflow-hidden"
    : "w-[360px] h-full flex flex-col shrink-0 overflow-hidden bg-white border border-border rounded-xl"

  const renderViewContent = () => {
    switch (currentView) {
      case "edit":
        return (
          <div className="h-full flex flex-col overflow-y-auto">
            <EditGroupView
              conversation={conversation}
              onSaved={handleBack}
              onCancel={handleBack}
            />
          </div>
        )

      case "members":
        return (
          <div className="h-full flex flex-col overflow-y-auto">
            <GroupMemberList
              participants={groupMembers}
              currentUserId={currentUser.id}
              conversation={conversation}
              hideHeader={true}
              onRemoveMember={handleRemoveMember}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenTransferModal={(member) => {
                setTransferTargetMember(member || null)
                setIsTransferModalOpen(true)
              }}
            />
          </div>
        )

      case "media":
        return (
          <SharedMediaGallery
            conversationId={conversation.id}
            fullHeight={true}
          />
        )

      case "search":
        return (
          <ChatSearchView
            conversationId={conversation.id}
            onJumpToMessage={onJumpToMessage}
          />
        )

      case "main":
      default:
        return (
          <div className="h-full flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Profile header section */}
              <div className="flex flex-col items-center pt-4">
                {isGroup ? (
                  <GroupAvatar conversation={conversation} size={84} />
                ) : (
                  <Avatar
                    size={84}
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

                {isGroup ? (
                  <div className="h-[72px] flex flex-col items-center justify-center">
                    <h2 className="font-semibold text-center">{name}</h2>
                    {statusText && (
                      <p className="text-sm text-[#606060]">{statusText}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      className={`${
                        otherUser?.level ? "h-[72px]" : "h-[56px]"
                      } flex flex-col items-center justify-center`}
                    >
                      {friendId ? (
                        <h2
                          onClick={() => navigate(getProfilePath(friendId))}
                          className="font-semibold text-center"
                        >
                          {name}
                        </h2>
                      ) : (
                        <h2 className="font-semibold text-center">{name}</h2>
                      )}

                      {otherUser?.level && (
                        <p className="text-sm text-secondary text-center">
                          {t?.chat?.userPanel?.level || "Level"}:{" "}
                          {otherUser.level}
                        </p>
                      )}
                    </div>

                    {friendId && (
                      <div className="w-full p-4">
                        <PillButton
                          onClick={() => navigate(getProfilePath(friendId))}
                          variant="primary"
                          size="sm"
                          className="w-full"
                        >
                          {t?.chat?.userPanel?.viewProfile || "View Profile"}
                        </PillButton>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Navigation Options ──────────────── */}
              <div className="flex flex-col">
                {navOptions.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <div
                      key={opt.id}
                      role="button"
                      tabIndex={0}
                      onClick={opt.onClick}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && opt.onClick()
                      }
                      className="w-full flex items-center justify-between px-4 h-[56px] hover:bg-itemHover active:bg-itemActiveHover transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 min-w-0 mr-2">
                        <Icon className="shrink-0" />
                        <p className="truncate">{opt.title}</p>
                      </div>
                      <ChevronRight className="shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Danger zone (Leave Group) */}
            {isGroup && (
              <div className="p-4 mt-auto">
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
          </div>
        )
    }
  }

  return (
    <div className={containerClasses}>
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between p-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {currentView !== "main" && (
            <>
              <IconButton
                onClick={handleBack}
                variant="ghost"
                size="sm"
                aria-label={t?.chat?.goBack || t?.common?.back || "Go back"}
                title={t?.chat?.goBack || t?.common?.back || "Go back"}
              >
                <ArrowLeft />
              </IconButton>
              <span className="font-semibold text-sm truncate">{headerTitle}</span>
            </>
          )}
        </div>
        <IconButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          aria-label={t?.chat?.closePanel || t?.common?.close || "Close panel"}
          title={t?.chat?.closePanel || t?.common?.close || "Close panel"}
        >
          <X />
        </IconButton>
      </div>

      {/* ── Content (Animated Stack) ──────────────── */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <Motion.div
            key={currentView}
            custom={direction}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={panelTransition}
            className="absolute inset-0 flex flex-col"
          >
            {renderViewContent()}
          </Motion.div>
        </AnimatePresence>
      </div>

      <AddMembersModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        conversationId={conversation.id}
        currentUser={currentUser}
        groupParticipantIds={groupParticipantIds}
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
    </div>
  )
}

export default memo(ChatUserPanel)
