import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/features/auth"
import {
  useCreatePrivateConversationMutation,
  useCreateGroupConversationMutation,
} from "@/store/api/social/conversationsApi"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { PillButton } from "@/shared/components/ui/buttons"

const NewChatModal = ({ open, onClose, onConversationCreated }) => {
  const { user: authUser } = useAuth()
  const [newChatTab, setNewChatTab] = useState("direct") // 'direct' | 'group'
  const [groupName, setGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [newChatSearch, setNewChatSearch] = useState("")

  const { data: friendsResponse } = useGetFriendsQuery(authUser?.accountId, {
    skip: !authUser?.accountId,
  })

  const friends = useMemo(() => {
    const arr = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []
    if (!newChatSearch.trim()) return arr
    const q = newChatSearch.toLowerCase()
    return arr.filter(
      (f) =>
        f.username?.toLowerCase().includes(q) ||
        f.nickname?.toLowerCase().includes(q),
    )
  }, [friendsResponse, newChatSearch])

  // ── Mutations ──────────────────────────────────────────
  const [createPrivateConversation] = useCreatePrivateConversationMutation()
  const [createGroupConversation] = useCreateGroupConversationMutation()

  // ── Handlers ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    setGroupName("")
    setSelectedFriends([])
    setNewChatSearch("")
    onClose()
  }, [onClose])

  const handleStartPrivateChat = useCallback(
    async (friendAccountId) => {
      try {
        const result = await createPrivateConversation(friendAccountId).unwrap()
        if (onConversationCreated) {
          onConversationCreated(result.conversationId)
        }
        handleClose()
      } catch (err) {
        console.error("Failed to start private chat:", err)
      }
    },
    [createPrivateConversation, onConversationCreated, handleClose],
  )

  const handleCreateGroupChat = useCallback(async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return
    try {
      const result = await createGroupConversation({
        groupName: groupName.trim(),
        participantAccountIds: selectedFriends,
      }).unwrap()
      if (onConversationCreated) {
        onConversationCreated(result.conversationId)
      }
      handleClose()
    } catch (err) {
      console.error("Failed to create group chat:", err)
    }
  }, [groupName, selectedFriends, createGroupConversation, onConversationCreated, handleClose])

  const toggleSelectFriend = useCallback((friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    )
  }, [])

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Start a new chat"
    >
      <div className="flex flex-col h-[500px]">
        {/* Tab Selection */}
        <div className="flex border-b border-[#E5E5E5] mb-4">
          <button
            onClick={() => setNewChatTab("direct")}
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
              newChatTab === "direct"
                ? "border-[#990011] text-[#990011]"
                : "border-transparent text-[#606060] hover:text-[#1A1A1A]"
            }`}
          >
            Direct Message
          </button>
          <button
            onClick={() => setNewChatTab("group")}
            className={`flex-1 py-2 text-center text-sm font-medium border-b-2 transition-colors ${
              newChatTab === "group"
                ? "border-[#990011] text-[#990011]"
                : "border-transparent text-[#606060] hover:text-[#1A1A1A]"
            }`}
          >
            New Group
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search friends..."
            value={newChatSearch}
            onChange={(e) => setNewChatSearch(e.target.value)}
            className="w-full h-10 px-4 rounded-xl bg-[#F2F2F2] text-sm text-[#1A1A1A] outline-none placeholder-[#9CA0AB] focus:bg-[#EBEBEB] focus:ring-1 focus:ring-[#990011]/20"
          />
        </div>

        {newChatTab === "direct" ? (
          <div className="flex-1 overflow-y-auto space-y-1">
            {friends.length === 0 ? (
              <p className="text-center text-sm text-[#9CA0AB] py-8">
                No friends found
              </p>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.accountId}
                  onClick={() => handleStartPrivateChat(friend.accountId)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F8F8F8] rounded-xl transition-colors text-left"
                >
                  <Avatar
                    src={friend.avatarImageUrl}
                    name={friend.nickname || friend.username}
                    size={40}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {friend.nickname || friend.username}
                    </p>
                    <p className="text-xs text-[#9CA0AB]">{friend.level}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Group Name Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full h-10 px-4 rounded-xl border border-[#E5E5E5] text-sm text-[#1A1A1A] outline-none focus:border-[#990011]"
              />
            </div>

            {/* Friends checklist */}
            <div className="flex-1 overflow-y-auto space-y-1 mb-4">
              {friends.length === 0 ? (
                <p className="text-center text-sm text-[#9CA0AB] py-8">
                  No friends available
                </p>
              ) : (
                friends.map((friend) => {
                  const isChecked = selectedFriends.includes(friend.accountId)
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
                        />
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {friend.nickname || friend.username}
                          </p>
                          <p className="text-xs text-[#9CA0AB]">
                            {friend.level}
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

            <div className="pt-2 border-t border-[#E5E5E5] flex justify-end">
              <PillButton
                onClick={handleCreateGroupChat}
                disabled={!groupName.trim() || selectedFriends.length === 0}
              >
                Create Group
              </PillButton>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default NewChatModal
