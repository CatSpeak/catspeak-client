import React, { useState } from "react"
import { Search, MoreHorizontal } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import toast from "react-hot-toast"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetPendingFriendRequestsQuery,
  useGetFriendRecommendationsQuery,
  useRespondFriendRequestMutation,
} from "../api/friendshipApi"
import { useNavigate } from "react-router-dom"

const ProfileFriendsTab = ({ targetAccountId, isOwnProfile, defaultSubTab }) => {
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
  const { data: recResponse, isLoading: loadingRecs, isFetching: fetchingRecs } =
    useGetFriendRecommendationsQuery(limit)
  const [respondFriendRequest] = useRespondFriendRequestMutation()

  const getArray = (res) => (Array.isArray(res) ? res : res?.data || [])

  // The backend might return the array directly or wrap it in a data property
  const pendingRequests = getArray(pendingResponse)

  console.log(pendingRequests)

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
    if (!isOwnProfile && (activeSubTab === "pending" || activeSubTab === "find")) {
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
      return <div className="text-gray-500 py-10 text-center">Đang tải...</div>
    }

    if (list.length === 0) {
      return (
        <div className="text-gray-500 py-10 text-center">{emptyMessage}</div>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((user) => (
          <div
            key={user.accountId}
            onClick={() => navigate(`/profile/${user.accountId}`)}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-white cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Avatar
                size={48}
                src={user.avatarImageUrl}
                name={user.nickname || user.username}
                className="w-12 h-12 bg-blue-100 text-blue-600 font-bold"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
                  {user.nickname || user.username}
                </h3>
                {/* Placeholder for mutual friends if that data becomes available */}
                <p className="text-xs text-gray-500 mt-1">
                  {user.level || "Member"}
                </p>
              </div>
            </div>
            {user.isPendingRequest ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    respondFriendRequest({
                      friendshipId: user.friendshipId,
                      action: "accept",
                    })
                      .unwrap()
                      .then(() => toast.success("Đã chấp nhận kết bạn!"))
                      .catch(() => toast.error("Có lỗi xảy ra"))
                  }}
                  className="px-4 py-1.5 bg-[#990011] text-white text-sm font-medium rounded-full hover:bg-red-900 transition-colors"
                >
                  Chấp nhận
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    respondFriendRequest({
                      friendshipId: user.friendshipId,
                      action: "decline",
                    })
                      .unwrap()
                      .then(() => toast.success("Đã từ chối kết bạn"))
                      .catch(() => toast.error("Có lỗi xảy ra"))
                  }}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  Từ chối
                </button>
              </div>
            ) : (
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {activeSubTab === "find" && list.length >= limit && (
        <div className="w-full flex justify-center mt-6">
          <button 
            onClick={() => setLimit(prev => prev + 10)}
            disabled={fetchingRecs}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors disabled:opacity-50"
          >
            {fetchingRecs ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </>
    )
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 pb-12 min-h-[500px]">
      {/* Search Bar */}
      <div className="mb-6 relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm"
          className="w-full h-11 pl-11 pr-4 bg-[#F5F6F8] border-none rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-200"
        />
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-gray-100 mb-8 overflow-x-auto hide-scrollbar">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-3 text-[15px] font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? "text-[#990011] border-b-2 border-[#990011]"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="bg-[#990011] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <div className="flex-grow"></div>
        <button className="pb-3 text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Grid Content */}
      {renderGridList()}
    </div>
  )
}

export default ProfileFriendsTab
