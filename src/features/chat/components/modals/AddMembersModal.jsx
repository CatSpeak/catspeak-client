import React, { useState, useMemo, useCallback } from "react"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import { useAddParticipantsMutation } from "@/store/api/social/conversationsApi"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import ListItem from "@/shared/components/ui/ListItem"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { Users } from "lucide-react"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

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

  const { data: friendsResponse } = useGetFriendsQuery(currentUser?.id, {
    skip: !currentUser?.id || !open,
  })

  const [addParticipants, { isLoading }] = useAddParticipantsMutation()

  const handleClose = useCallback(() => {
    setSelectedFriends([])
    setSearchQuery("")
    onClose()
  }, [onClose])

  // Get list of friends not already in the group chat
  const addableFriends = useMemo(() => {
    const arr = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []

    // Filter out participants already in the group
    return arr.filter(
      (f) => !groupParticipantIds.includes(f.accountId),
    )
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
      bodyClassName="px-0 flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex flex-col md:max-h-[80vh] flex-1">
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
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {filteredFriends.length === 0 ? (
            <EmptyState
              variant="component"
              icon={Users}
              message={
                addableFriends.length === 0
                  ? (t?.chat?.modals?.allInGroup || "All of your friends are already in this group")
                  : (t?.chat?.modals?.noFriendsFound || "No friends found matching your search")
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
                    <Checkbox checked={isChecked} variant="large" as="div" />
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
          <PillButton onClick={handleClose} variant="secondary-no-outline">
            {t?.chat?.modals?.cancel || "Cancel"}
          </PillButton>
          <PillButton
            onClick={handleAdd}
            disabled={selectedFriends.length === 0}
            loading={isLoading}
          >
            {t?.chat?.modals?.addMembersBtn
              ? t.chat.modals.addMembersBtn.replace("{{count}}", selectedFriends.length > 0 ? selectedFriends.length : "")
              : `Add ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ""} members`}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(AddMembersModal)
