import React, { useState, useRef, useEffect } from "react"
import { MoreHorizontal, User, UserCheck, UserX } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetPendingFriendRequestsQuery,
  useGetFriendRecommendationsQuery,
  useRespondFriendRequestMutation,
} from "../../../store/api/social/friendshipApi"
import { useNavigate, useLocation } from "react-router-dom"
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
import { IconButton } from "@/shared/components/ui/buttons"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"

const ProfileFriendsTab = ({
  targetAccountId,
  isOwnProfile,
  defaultSubTab,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab || "all")
  const [searchQuery, setSearchQuery] = useState("")
  const [limit, setLimit] = useState(10)
  const secondLastRecRef = useRef(null)

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
  } = useGetFriendRecommendationsQuery(searchQuery ? 9999 : limit)

  // Infinite scroll — observe second-to-last recommendation card
  useEffect(() => {
    if (!secondLastRecRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetchingRecs) {
          setLimit((prev) => prev + 10)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(secondLastRecRef.current)
    return () => observer.disconnect()
  }, [recResponse, fetchingRecs])
  const [respondFriendRequest] = useRespondFriendRequestMutation()

  const handleRespondRequest = (friendshipId, action, closePopover) => {
    closePopover()
    respondFriendRequest({ friendshipId, action }).unwrap().catch(() => {})
  }

  const getArray = (res) => (Array.isArray(res) ? res : res?.data || [])

  // The backend might return the array directly or wrap it in a data property
  const pendingRequests = getArray(pendingResponse)

  const subTabs = [
    { id: "all", label: t.profile?.friends?.subTabs?.all || "Tất cả bạn bè" },
    { id: "following", label: t.profile?.friends?.subTabs?.following || "Đang theo dõi" },
    { id: "followers", label: t.profile?.friends?.subTabs?.followers || "Người theo dõi" },
  ]

  // Add "Pending Requests" only for own profile
  if (isOwnProfile) {
    subTabs.push({
      id: "pending",
      label: t.profile?.friends?.subTabs?.pending || "Yêu cầu kết nối",
      badge:
        pendingRequests.length > 0 ? pendingRequests.length.toString() : null,
    })
    subTabs.push({ id: "find", label: t.profile?.friends?.subTabs?.find || "Tìm bạn bè" })
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
    let emptyMessage = t.profile?.friends?.empty?.noData || "Không có dữ liệu"

    if (activeSubTab === "all") {
      list = getArray(friendsResponse)
      isLoading = loadingFriends
      emptyMessage = t.profile?.friends?.empty?.noFriends || "Chưa có bạn bè nào."
    } else if (activeSubTab === "following") {
      list = getArray(followingResponse)
      isLoading = loadingFollowing
      emptyMessage = t.profile?.friends?.empty?.noFollowing || "Chưa theo dõi ai."
    } else if (activeSubTab === "followers") {
      list = getArray(followersResponse)
      isLoading = loadingFollowers
      emptyMessage = t.profile?.friends?.empty?.noFollowers || "Chưa có người theo dõi."
    } else if (activeSubTab === "pending") {
      list = pendingRequests.map((req) => ({
        ...req.requester,
        friendshipId: req.friendshipId,
        isPendingRequest: true,
      }))
      isLoading = loadingPending
      emptyMessage = t.profile?.friends?.empty?.noPending || "Không có yêu cầu kết nối nào."
    } else if (activeSubTab === "find") {
      list = getArray(recResponse)
      isLoading = loadingRecs
      emptyMessage = t.profile?.friends?.empty?.noRecommendations || "Không có gợi ý nào."
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

    const secondLastId =
      list[list.length - 2]?.accountId ?? list[list.length - 1]?.accountId
    const hasMore = activeSubTab === "find" && !searchQuery && list.length >= limit

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((user) => {
            const isSecondLast =
              activeSubTab === "find" && user.accountId === secondLastId
            return (
              <div
                key={user.accountId}
                ref={isSecondLast ? secondLastRecRef : null}
              >
                <HorizontalCard
                  onClick={() => {
                    const isWorkspace = location.pathname.startsWith("/workspace")
                    navigate(`${isWorkspace ? "/workspace" : ""}/profile/${user.accountId}`)
                  }}
                  leftContent={
                    <Avatar
                      size={40}
                      src={user.avatarImageUrl}
                      name={user.nickname || user.username}
                      accountId={user.accountId}
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
                              label={t.profile?.friends?.actions?.accept || "Chấp nhận"}
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
                              label={t.profile?.friends?.actions?.decline || "Từ chối"}
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
                  <p className="text-sm text-[#606060]">{user.level || t.profile?.friends?.member || "Member"}</p>
                </HorizontalCard>
              </div>
            )
          })}
        </div>

        {/* Infinite scroll loading spinner */}
        {hasMore && fetchingRecs && (
          <div className="flex justify-center py-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3 min-h-[500px]">
      {/* Top Header Card containing Tabs and Search */}
      <FluentCard padding="p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border p-4 sm:p-6">
          <h2 className="text-xl font-bold">{t.profile?.friends?.title || "Bạn bè"}</h2>
          {/* Search Bar */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.profile?.friends?.searchPlaceholder || "Tìm kiếm bạn bè..."}
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
