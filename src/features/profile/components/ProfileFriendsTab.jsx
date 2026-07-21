import React, { useState } from "react"
import { MoreHorizontal, User, UserCheck, UserX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import toast from "react-hot-toast"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetPendingFriendRequestsQuery,
  useGetFriendRecommendationsQuery,
  useRespondFriendRequestMutation,
} from "../../../store/api/social/friendshipApi"
import { useNavigate } from "react-router-dom"
import FluentCard from "@/shared/components/ui/FluentCard"
import HorizontalCard from "@/shared/components/ui/HorizontalCard"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import {
  LoadingSpinner,
  Skeleton,
  EmptyState,
} from "@/shared/components/ui/indicators"
import Popover from "@/shared/components/ui/Popover"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"

const ProfileFriendsTab = ({
  targetAccountId,
  isOwnProfile,
  defaultSubTab,
}) => {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab || "all")
  const [searchQuery, setSearchQuery] = useState("")
  const [limit, setLimit] = useState(10)

  // Fetch all potential data
  const { data: friendsResponse, isLoading: loadingFriends } =
    useGetFriendsQuery(targetAccountId, { skip: !targetAccountId })
  const { data: followersResponse, isLoading: loadingFollowers } =
    useGetFollowersQuery(targetAccountId, { skip: !targetAccountId })
  const { data: followingResponse, isLoading: loadingFollowing } =
    useGetFollowingQuery(targetAccountId, { skip: !targetAccountId })

  // Only fetch pending requests if viewing own profile
  const { data: pendingResponse, isLoading: loadingPending } =
    useGetPendingFriendRequestsQuery(undefined, { skip: !isOwnProfile })
  const {
    data: recResponse,
    isLoading: loadingRecs,
    isFetching: fetchingRecs,
  } = useGetFriendRecommendationsQuery(limit)
  const [respondFriendRequest] = useRespondFriendRequestMutation()

  const handleRespondRequest = (friendshipId, action, closePopover) => {
    closePopover()
    respondFriendRequest({ friendshipId, action })
      .unwrap()
      .then(() => {
        toast.success(
          action === "accept" ? "Đã chấp nhận kết bạn!" : "Đã từ chối kết bạn",
        )
      })
      .catch(() => toast.error("Có lỗi xảy ra"))
  }

  const getArray = (res) => (Array.isArray(res) ? res : res?.data || [])

  // The backend might return the array directly or wrap it in a data property
  const pendingRequests = getArray(pendingResponse)

  const subTabs = [
    { id: "all", label: "Tất cả bạn bè" },
    { id: "following", label: "Đang theo dõi" },
    { id: "followers", label: "Người theo dõi" },
  ]

  // Add "Pending Requests" only for own profile
  if (isOwnProfile) {
    subTabs.push({
      id: "pending",
      label: "Yêu cầu kết nối",
      badge:
        pendingRequests.length > 0 ? pendingRequests.length.toString() : null,
    })
    subTabs.push({ id: "find", label: "Tìm bạn bè" })
  }

  // Reset activeSubTab to 'all' if navigating to another user's profile while on a restricted tab
  React.useEffect(() => {
    if (
      !isOwnProfile &&
      (activeSubTab === "pending" || activeSubTab === "find")
    ) {
      setActiveSubTab("all")
    }
  }, [isOwnProfile, activeSubTab])

  const renderGridList = () => {
    let list = []
    let isLoading = false
    let emptyMessage = "Không có dữ liệu"

    if (activeSubTab === "all") {
      list = getArray(friendsResponse)
      isLoading = loadingFriends
      emptyMessage = "Chưa có bạn bè nào."
    } else if (activeSubTab === "following") {
      list = getArray(followingResponse)
      isLoading = loadingFollowing
      emptyMessage = "Chưa theo dõi ai."
    } else if (activeSubTab === "followers") {
      list = getArray(followersResponse)
      isLoading = loadingFollowers
      emptyMessage = "Chưa có người theo dõi."
    } else if (activeSubTab === "pending") {
      list = pendingRequests.map((req) => ({
        ...req.requester,
        friendshipId: req.friendshipId,
        isPendingRequest: true,
      }))
      isLoading = loadingPending
      emptyMessage = "Không có yêu cầu kết nối nào."
    } else if (activeSubTab === "find") {
      list = getArray(recResponse)
      isLoading = loadingRecs
      emptyMessage = "Không có gợi ý nào."
    }

    if (searchQuery) {
      list = list.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FluentCard
              key={i}
              padding="p-0"
              className="min-h-[80px] flex items-center justify-center"
            >
              <div className="flex items-center gap-4 px-4 w-full">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </FluentCard>
          ))}
        </div>
      )
    }

    if (list.length === 0) {
      return (
        <FluentCard>
          <EmptyState message={emptyMessage} icon={User} />
        </FluentCard>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((user) => (
            <HorizontalCard
              key={user.accountId}
              onClick={() => navigate(`/profile/${user.accountId}`)}
              leftContent={
                <Avatar
                  size={40}
                  src={user.avatarImageUrl}
                  name={user.nickname || user.username}
                />
              }
              rightContent={
                user.isPendingRequest ? (
                  <Popover
                    placement="bottom-right"
                    trigger={
                      <IconButton variant="ghost">
                        <MoreHorizontal />
                      </IconButton>
                    }
                    content={(close) => (
                      <MenuList>
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRespondRequest(
                              user.friendshipId,
                              "accept",
                              close,
                            )
                          }}
                          icon={<UserCheck />}
                          label="Chấp nhận"
                        />
                        <MenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRespondRequest(
                              user.friendshipId,
                              "decline",
                              close,
                            )
                          }}
                          icon={<UserX />}
                          label="Từ chối"
                          className="text-red-600"
                        />
                      </MenuList>
                    )}
                  />
                ) : null
              }
            >
              <h3 className="font-semibold">
                {user.nickname || user.username}
              </h3>

              <p className="text-sm text-[#606060]">{user.level || "Member"}</p>
            </HorizontalCard>
          ))}
        </div>

        {activeSubTab === "find" && list.length >= limit && (
          <div className="w-full flex justify-center mt-6">
            <PillButton
              onClick={() => setLimit((prev) => prev + 10)}
              loading={fetchingRecs}
              loadingText="Đang tải..."
              variant="secondary"
            >
              Tải thêm
            </PillButton>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3 min-h-[500px]">
      {/* Top Header Card containing Tabs and Search */}
      <FluentCard padding="p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5e5] p-4 sm:p-6">
          <h2 className="text-xl font-bold">Bạn bè</h2>
          {/* Search Bar */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm bạn bè..."
            className="md:w-[360px]"
          />
        </div>

        {/* Sub Tabs Navigation */}
        <Tabs
          tabs={subTabs}
          activeTab={activeSubTab}
          onChange={setActiveSubTab}
          fullWidth={false}
          className="border-none"
        />
      </FluentCard>

      {/* Grid Content */}
      <div className="w-full">{renderGridList()}</div>
    </div>
  )
}

export default ProfileFriendsTab
