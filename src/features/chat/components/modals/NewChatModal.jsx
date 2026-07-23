import { useState, useMemo, useCallback } from "react"
import { useAuth } from "@/features/auth"
import {
  useCreatePrivateConversationMutation,
  useCreateGroupConversationMutation,
} from "@/store/api/social/conversationsApi"
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { Users } from "lucide-react"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import GroupMemberSelector from "./GroupMemberSelector"
import GroupDetailsForm from "./GroupDetailsForm"
import { useLanguage } from "@/shared/context/LanguageContext"

const NewChatModal = ({ open, onClose, onConversationCreated }) => {
  const { t } = useLanguage()
  const { user: authUser } = useAuth()
  const [newChatTab, setNewChatTab] = useState("direct") // 'direct' | 'group'
  const [groupStep, setGroupStep] = useState("select-members") // 'select-members' | 'details'
  const [groupName, setGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [newChatSearch, setNewChatSearch] = useState("")

  const newChatTabs = useMemo(
    () => [
      { id: "direct", label: t?.chat?.modals?.directMessage || "Direct Message" },
      { id: "group", label: t?.chat?.modals?.newGroup || "New Group" },
    ],
    [t],
  )

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

  const selectedFriendsData = useMemo(() => {
    const arr = Array.isArray(friendsResponse)
      ? friendsResponse
      : friendsResponse?.data || []
    return arr.filter((f) => selectedFriends.includes(f.accountId))
  }, [friendsResponse, selectedFriends])

  // ── Mutations ──────────────────────────────────────────
  const [createPrivateConversation] = useCreatePrivateConversationMutation()
  const [createGroupConversation, { isLoading: isCreatingGroup }] =
    useCreateGroupConversationMutation()

  // ── Handlers ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    setGroupName("")
    setSelectedFriends([])
    setNewChatSearch("")
    setGroupStep("select-members")
    onClose()
  }, [onClose])

  const handleTabChange = useCallback((tab) => {
    setNewChatTab(tab)
    setGroupStep("select-members")
    setGroupName("")
    setSelectedFriends([])
    setNewChatSearch("")
  }, [])

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
  }, [
    groupName,
    selectedFriends,
    createGroupConversation,
    onConversationCreated,
    handleClose,
  ])

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
      title={t?.chat?.modals?.newChatTitle || "Start a new chat"}
      bodyClassName="px-0 flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex flex-col md:max-h-[80vh] flex-1">
        {/* Tab Selection */}
        <Tabs
          tabs={newChatTabs}
          activeTab={newChatTab}
          onChange={handleTabChange}
          className="mb-4 px-4"
        />

        {newChatTab === "direct" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search bar */}
            <div className="px-4 pb-4">
              <SearchInput
                placeholder={t?.chat?.modals?.searchFriends || "Search friends..."}
                value={newChatSearch}
                onChange={setNewChatSearch}
                className="min-w-0"
              />
            </div>

            {/* Direct Message List */}
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-4 pb-4">
              {friends.length === 0 ? (
                <EmptyState
                  variant="component"
                  icon={Users}
                  message={t?.chat?.modals?.noFriendsFound || "No friends found"}
                />
              ) : (
                friends.map((friend) => {
                  const theme = getParticipantTheme(
                    friend.accountId || friend.username || "",
                  )
                  return (
                    <ListItem
                      key={friend.accountId}
                      onClick={() => handleStartPrivateChat(friend.accountId)}
                      hoverEffect={true}
                      className="overflow-hidden cursor-pointer shrink-0"
                      contentClassName="rounded-xl"
                      lines={2}
                      leftContent={
                        <Avatar
                          src={friend.avatarImageUrl}
                          name={friend.nickname || friend.username}
                          size={40}
                          className={theme.avatarClass}
                        />
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
          </div>
        ) : groupStep === "select-members" ? (
          <GroupMemberSelector
            friends={friends}
            selectedFriends={selectedFriends}
            onToggleFriend={toggleSelectFriend}
            searchQuery={newChatSearch}
            onSearchChange={setNewChatSearch}
            onNext={() => setGroupStep("details")}
            onClose={handleClose}
          />
        ) : (
          <GroupDetailsForm
            groupName={groupName}
            setGroupName={setGroupName}
            selectedFriendsData={selectedFriendsData}
            onRemoveFriend={toggleSelectFriend}
            onCreateGroup={handleCreateGroupChat}
            onBack={() => setGroupStep("select-members")}
            isLoading={isCreatingGroup}
          />
        )}
      </div>
    </Modal>
  )
}

export default NewChatModal
