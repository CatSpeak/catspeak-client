import React, { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { Users, Search } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectCurrentUser } from "@/store/slices/authSlice"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import { useInviteToRoomMutation } from "@/store/api/roomsApi"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const InviteParticipantModal = ({ open, onClose, roomId }) => {
  const { t } = useLanguage()
  const currentUser = useSelector(selectCurrentUser)
  const [selectedAccountIds, setSelectedAccountIds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const effectiveAccountId =
    currentUser?.accountId ?? currentUser?.id ?? currentUser?.userId

  const { data: friendsResponse, isLoading: isFriendsLoading } =
    useGetFriendsQuery(effectiveAccountId, {
      skip: !open || !effectiveAccountId,
      refetchOnFocus: false,
    })

  const [inviteToRoom, { isLoading: isInviting }] = useInviteToRoomMutation()

  const { id: contextRoomId } = useGlobalVideoCall()
  const effectiveRoomId = roomId || contextRoomId

  const handleModalClose = () => {
    setSelectedAccountIds([])
    setSearchQuery("")
    onClose?.()
  }

  // Normalize friends list
  const friendsList = useMemo(() => {
    if (!friendsResponse) return []
    const list = Array.isArray(friendsResponse)
      ? friendsResponse
      : Array.isArray(friendsResponse.data)
        ? friendsResponse.data
        : []

    return list
      .map((item) => {
        const userObj = item.friend || item.user || item
        const rawId =
          userObj.accountId ??
          userObj.id ??
          userObj.userId ??
          item.accountId ??
          item.id
        const accountId = rawId != null ? Number(rawId) : undefined
        return {
          ...userObj,
          accountId,
          username: userObj.username || userObj.name || userObj.nickname,
          email: userObj.email,
          avatarImageUrl:
            userObj.avatarImageUrl ||
            userObj.avatarUrl ||
            userObj.meetingAvatarUrl,
        }
      })
      .filter((u) => u && u.accountId != null)
  }, [friendsResponse])

  // Filter friends by search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friendsList
    const q = searchQuery.toLowerCase().trim()
    return friendsList.filter((friend) => {
      const name = (friend.username || friend.name || "").toLowerCase()
      const email = (friend.email || "").toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [friendsList, searchQuery])

  if (!open) return null

  const handleToggleSelect = (accountId) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    )
  }

  const handleInvite = async () => {
    const idsToSend = (
      Array.isArray(selectedAccountIds)
        ? selectedAccountIds
        : [selectedAccountIds]
    )
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0)

    if (idsToSend.length === 0) {
      toast.error(
        t.rooms?.videoCall?.selectAtLeastOne ||
          "Please select at least one friend to invite",
      )
      return
    }

    if (!effectiveRoomId) {
      toast.error(t.common?.errorOccurred || "Room information not found")
      return
    }

    try {
      const res = await inviteToRoom({
        roomId: effectiveRoomId,
        accountIds: idsToSend,
      }).unwrap()

      const results =
        res?.results || res?.data?.results || (Array.isArray(res) ? res : [])

      const invitedCount = results.filter((r) => r.status === "invited").length
      const alreadyInRoomCount = results.filter(
        (r) => r.status === "already_in_room",
      ).length
      const notFoundCount = results.filter(
        (r) => r.status === "not_found",
      ).length

      if (invitedCount > 0) {
        if (alreadyInRoomCount > 0 || notFoundCount > 0) {
          const details = []
          if (alreadyInRoomCount > 0)
            details.push(`${alreadyInRoomCount} đã ở trong phòng`)
          if (notFoundCount > 0) details.push(`${notFoundCount} không tìm thấy`)
          toast.success(
            `Đã gửi lời mời cho ${invitedCount} người (${details.join(", ")})`,
          )
        } else {
          toast.success(
            t.rooms?.notifications?.inviteSent || "Invitation sent successfully",
          )
        }
        handleModalClose()
      } else if (alreadyInRoomCount > 0) {
        toast.error(
          t.rooms?.videoCall?.alreadyInRoom ||
            "The selected friend is already in the meeting room.",
        )
      } else {
        toast.error(
          res?.message || t.common?.errorOccurred || "Failed to send the invitation",
        )
      }
    } catch (err) {
      console.error("Failed to send invite:", err)
      toast.error(
        err?.data?.message || t.common?.errorOccurred || "An error occurred",
      )
    }
  }

  const title = t.rooms?.videoCall?.inviteParticipant || "Mời tham gia phòng"
  const selectedCount = selectedAccountIds.length
  const hasSelection = selectedCount > 0

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      title={title}
      ariaLabel={title}
      showCloseButton
      fullScreenOnMobile={false}
      className="md:max-w-md rounded-3xl"
      bodyClassName="px-0 flex flex-col flex-1 overflow-hidden min-h-0"
      footerClassName="p-4 flex justify-end shrink-0"
      footer={
        <div className="flex items-center justify-end w-full">
          <PillButton
            onClick={handleInvite}
            disabled={isInviting || !hasSelection}
            loading={isInviting}
            loadingText={t.common?.sending || "Sending..."}
            variant="primary"
          >
            {`${t.rooms?.videoCall?.sendInvite || "Gửi lời mời"}${
              hasSelection ? ` (${selectedCount})` : ""
            }`}
          </PillButton>
        </div>
      }
    >
      {/* Search Input when friends list is available */}
      {friendsList.length > 5 && (
        <div className="p-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder={
              t?.inviteDropdown?.searchFriends || "Search friends..."
            }
          />
        </div>
      )}

      {/* Scrollable Friends List */}
      <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] flex flex-col scrollbar-thin">
        {isFriendsLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <LoadingSpinner text={t.common?.loading || "Loading..."} />
          </div>
        ) : friendsList.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t.rooms?.videoCall?.noFriendsFound || "No friends yet"}
            description={
              t.rooms?.videoCall?.noFriendsHint ||
              "Add friends so you can invite them to the room."
            }
            variant="component"
          />
        ) : filteredFriends.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t.common?.noResultsFound || "No friends found"}
            description={
              t.common?.tryAnotherSearch || "Try a different search keyword."
            }
            variant="component"
          />
        ) : (
          filteredFriends.map((friend) => {
            const isSelected = selectedAccountIds.includes(friend.accountId)
            const displayName =
              friend.username || friend.name || `User #${friend.accountId}`

            return (
              <ListItem
                key={friend.accountId}
                onClick={() => handleToggleSelect(friend.accountId)}
                hoverEffect={true}
                selected={isSelected}
                lines={friend.email ? 2 : 1}
                className="w-full cursor-pointer"
                leftContent={
                  <Avatar
                    size={40}
                    name={displayName}
                    src={friend.avatarImageUrl}
                    clickable={false}
                  />
                }
                rightContent={<Checkbox checked={isSelected} as="div" />}
              >
                <span className="text-base text-gray-900 dark:text-white truncate">
                  {displayName}
                </span>
                {friend.email && (
                  <span className="text-sm text-secondary dark:text-[#AAAAAA] truncate">
                    {friend.email}
                  </span>
                )}
              </ListItem>
            )
          })
        )}
      </div>
    </Modal>
  )
}

export default InviteParticipantModal
