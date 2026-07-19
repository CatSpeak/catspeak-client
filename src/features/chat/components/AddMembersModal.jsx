import React, { useState, useMemo, useCallback } from "react"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import { useAddParticipantsMutation } from "@/store/api/social/conversationsApi"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

const AddMembersModal = ({
  open,
  onClose,
  conversationId,
  currentUser,
  groupParticipantIds = [],
}) => {
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
        : [...prev, friendId]
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
      title="Add members to group"
    >
      <div className="flex flex-col h-[400px]">
        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl bg-[#F2F2F2] text-sm text-[#1A1A1A] outline-none placeholder-[#9CA0AB] focus:bg-[#EBEBEB] focus:ring-1 focus:ring-[#990011]/20"
          />
        </div>

        {/* Friends checklist */}
        <div className="flex-1 overflow-y-auto space-y-1 mb-4">
          {filteredFriends.length === 0 ? (
            <p className="text-center text-sm text-[#9CA0AB] py-8">
              {addableFriends.length === 0 ? "All of your friends are already in this group" : "No friends found matching your search"}
            </p>
          ) : (
            filteredFriends.map((friend) => {
              const isChecked = selectedFriends.includes(friend.accountId)
              const theme = getParticipantTheme(
                friend.accountId || friend.username || "",
              )
              return (
                <div
                  key={friend.accountId}
                  onClick={() => toggleSelectFriend(friend.accountId)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-[#F8F8F8] rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={friend.avatarImageUrl}
                      name={friend.nickname || friend.username}
                      size={40}
                      className={theme.avatarClass}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {friend.nickname || friend.username}
                      </p>
                      <p className="text-xs text-[#9CA0AB]">
                        {friend.level || "Student"}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div click
                    className="w-4 h-4 rounded text-[#990011] focus:ring-[#990011]/20 border-[#E5E5E5]"
                  />
                </div>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
          <PillButton
            onClick={handleClose}
            variant="secondary-no-outline"
          >
            Cancel
          </PillButton>
          <PillButton
            onClick={handleAdd}
            disabled={selectedFriends.length === 0}
            loading={isLoading}
          >
            Add {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ""} members
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}

export default React.memo(AddMembersModal)
