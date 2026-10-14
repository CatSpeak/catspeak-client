import React, { useState, useMemo, useCallback } from "react"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import {
  useAddParticipantsMutation,
  useGetGroupInviteLinkQuery,
} from "@/store/api/social/conversationsApi"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import ListItem from "@/shared/components/ui/ListItem"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { Users, Copy, Check } from "lucide-react"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

const AddMembersModal = ({
  open,
  onClose,
  conversationId,
  currentUser,
  groupParticipantIds = [],
}) => {
  const { t } = useLanguage()
  const [selectedFriends, setSelectedFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)

  const { data: friendsResponse } = useGetFriendsQuery(currentUser?.id, {
    skip: !currentUser?.id,
  })

  const { data: inviteLinkData } = useGetGroupInviteLinkQuery(conversationId, {
    skip: !conversationId,
  })

  const inviteCode = inviteLinkData?.inviteCode
  const isInviteEnabled = Boolean(inviteLinkData?.isEnabled)

  const fullInviteUrl = useMemo(() => {
    const rawUrl = inviteLinkData?.inviteUrl
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    if (rawUrl) {
      if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        return rawUrl
      }
      return `${origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`
    }
    if (inviteCode) {
      return `${origin}/invite/${inviteCode}`
    }
    return ""
  }, [inviteLinkData?.inviteUrl, inviteCode])

  const handleCopyInviteLink = async () => {
    if (!fullInviteUrl) return
    try {
      await navigator.clipboard.writeText(fullInviteUrl)
      setCopiedLink(true)
      toast.success(
        t?.chat?.inviteLinkCopied ||
          "Đã sao chép liên kết mời vào khay nhớ tạm!",
      )
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error(t?.chat?.copyLinkFailed || "Không thể sao chép liên kết")
    }
  }

  const [addParticipants, { isLoading }] = useAddParticipantsMutation()

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setSelectedFriends([])
      setSearchQuery("")
    }, 220)
  }, [onClose])

  // Get list of friends not already in the group chat
  const addableFriends = useMemo(() => {
    const arr = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []

    // Filter out participants already in the group
    return arr.filter((f) => !groupParticipantIds.includes(f.accountId))
  }, [friendsResponse, groupParticipantIds])

  // Apply search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return addableFriends
    const q = searchQuery.toLowerCase()
    return addableFriends.filter(
      (f) =>
        f.username?.toLowerCase().includes(q) ||
        f.nickname?.toLowerCase().includes(q),
    )
  }, [addableFriends, searchQuery])

  const toggleSelectFriend = useCallback((friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    )
  }, [])

  const handleAdd = useCallback(async () => {
    if (selectedFriends.length === 0) return
    try {
      await addParticipants({
        conversationId,
        accountIds: selectedFriends,
      }).unwrap()
      handleClose()
    } catch (err) {
      console.error("Failed to add members:", err)
    }
  }, [addParticipants, conversationId, selectedFriends, handleClose])

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t?.chat?.modals?.addMembersTitle || "Add members to group"}
      fullScreenOnMobile={false}
      className="rounded-xl border border-border"
      headerClassName="flex items-center justify-between p-4"
      bodyClassName="px-0 flex-1 flex flex-col overflow-hidden min-h-0"
      footerClassName="p-4 border-t border-border"
      footer={
        <div className="flex flex-col gap-4">
          {/* Invite link quick share option */}
          {inviteCode && isInviteEnabled && (
            <TextInput
              label={
                t?.chat?.copyInviteLinkTitle ||
                "Hoặc mời bằng liên kết tham gia"
              }
              labelClassName="text-secondary"
              readOnly
              value={fullInviteUrl}
              containerClassName="w-full"
              variant="square"
              className="hover:!border-border focus:!border-border select-all"
              rightContentClassName="right-1"
              rightContentWidthClass="!pr-14"
              rightContent={
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyInviteLink}
                  title={t?.chat?.copyLink || "Sao chép liên kết"}
                  aria-label={t?.chat?.copyLink || "Copy Link"}
                >
                  {copiedLink ? (
                    <Check className="text-emerald-500" />
                  ) : (
                    <Copy />
                  )}
                </IconButton>
              }
            />
          )}

          <div className="flex justify-end">
            <PillButton
              onClick={handleAdd}
              disabled={selectedFriends.length === 0}
              loading={isLoading}
            >
              {t?.chat?.modals?.addMembersBtn
                ? t.chat.modals.addMembersBtn.replace(
                    "{{count}}",
                    selectedFriends.length > 0 ? selectedFriends.length : "",
                  )
                : `Add ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ""} members`}
            </PillButton>
          </div>
        </div>
      }
    >
      {/* Search bar */}
      <div className="px-4 pb-4">
        <SearchInput
          placeholder={t?.chat?.modals?.searchFriends || "Search friends..."}
          value={searchQuery}
          onChange={setSearchQuery}
          className="min-w-0"
        />
      </div>

      {/* Friends checklist */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        {filteredFriends.length === 0 ? (
          <EmptyState
            variant="component"
            icon={Users}
            message={
              addableFriends.length === 0
                ? t?.chat?.modals?.allInGroup ||
                  "All of your friends are already in this group"
                : t?.chat?.modals?.noFriendsFound ||
                  "No friends found matching your search"
            }
          />
        ) : (
          filteredFriends.map((friend) => {
            const isChecked = selectedFriends.includes(friend.accountId)
            const theme = getParticipantTheme(
              friend.accountId || friend.username || "",
            )
            return (
              <ListItem
                key={friend.accountId}
                onClick={() => toggleSelectFriend(friend.accountId)}
                hoverEffect={true}
                className="overflow-hidden cursor-pointer shrink-0"
                contentClassName={`${isChecked ? "bg-primaryBg" : ""}`}
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
                  <Checkbox checked={isChecked} variant="large" as="div" />
                }
              >
                <p>{friend.nickname || friend.username}</p>
                <p className="text-sm text-[#606060]">
                  {friend.isTeacher
                    ? t?.chat?.userPanel?.teacher || "Giảng viên"
                    : friend.level || t?.chat?.userPanel?.student || "Student"}
                </p>
              </ListItem>
            )
          })
        )}
      </div>
    </Modal>
  )
}

export default React.memo(AddMembersModal)
