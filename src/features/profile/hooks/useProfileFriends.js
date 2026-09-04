import { useState, useRef, useEffect, useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import useDebounce from "@/shared/hooks/useDebounce"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetPendingFriendRequestsQuery,
  useGetFriendRecommendationsQuery,
} from "@/store/api/social/friendshipApi"

const normalize = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()

const getArray = (res) => (Array.isArray(res) ? res : res?.data || [])

export const useProfileFriends = ({
  targetAccountId,
  isOwnProfile,
  defaultSubTab,
  currentUserId,
}) => {
  const { t } = useLanguage()
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab || "all")
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [recPage, setRecPage] = useState(1)
  const bottomSentinelRef = useRef(null)

  // Reset pagination on tab/search change
  useEffect(() => {
    setRecPage(1)
  }, [debouncedSearchQuery, activeSubTab])

  // Reset restricted tab on external profile
  useEffect(() => {
    if (
      !isOwnProfile &&
      (activeSubTab === "pending" || activeSubTab === "find")
    ) {
      setActiveSubTab("all")
    }
  }, [isOwnProfile, activeSubTab])

  // Queries
  const { data: friendsRes, isLoading: loadingFriends } = useGetFriendsQuery(
    targetAccountId,
    { skip: !targetAccountId },
  )
  const { data: followersRes, isLoading: loadingFollowers } =
    useGetFollowersQuery(targetAccountId, { skip: !targetAccountId })
  const { data: followingRes, isLoading: loadingFollowing } =
    useGetFollowingQuery(targetAccountId, { skip: !targetAccountId })
  const { data: pendingRes, isLoading: loadingPending } =
    useGetPendingFriendRequestsQuery(undefined, {
      skip: !isOwnProfile,
      pollingInterval: 4000,
    })
  const {
    data: recRes,
    isLoading: loadingRecs,
    isFetching: fetchingRecs,
  } = useGetFriendRecommendationsQuery(
    {
      SearchKeyword: debouncedSearchQuery || undefined,
      Page: recPage,
      PageSize: 10,
    },
    { skip: !isOwnProfile },
  )
  // My following list for cross-check on other people's profiles.
  // When viewing own profile, followingRes already is my list.
  const { data: myFollowingRes } = useGetFollowingQuery(currentUserId, {
    skip: isOwnProfile || !currentUserId,
  })

  // Infinite Scroll Observer for bottom sentinel
  useEffect(() => {
    if (!bottomSentinelRef.current || activeSubTab !== "find") return
    const hasMore = recRes?.hasMore !== false
    if (!hasMore || fetchingRecs) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetchingRecs && hasMore) {
          setRecPage((p) => p + 1)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(bottomSentinelRef.current)
    return () => observer.disconnect()
  }, [recRes, fetchingRecs, activeSubTab])

  const pendingRequests = useMemo(() => getArray(pendingRes), [pendingRes])
  const friendsList = useMemo(() => getArray(friendsRes), [friendsRes])
  const followingList = useMemo(
    () => getArray(followingRes),
    [followingRes],
  )
  const followersList = useMemo(
    () => getArray(followersRes),
    [followersRes],
  )
  const myFollowingList = useMemo(
    () => getArray(myFollowingRes),
    [myFollowingRes],
  )

  // Set of accountIds that the viewer is following.
  // Own profile: followingList is mine. Other profile: myFollowingList is mine.
  const followingIdSet = useMemo(() => {
    const source = isOwnProfile ? followingList : myFollowingList
    const set = new Set()
    for (const u of source) {
      const id = u?.accountId ?? u?.id ?? u?.userId
      if (id != null) set.add(Number(id))
    }
    return set
  }, [isOwnProfile, followingList, myFollowingList])

  // Subtabs configuration
  const subTabs = useMemo(() => {
    const badgeOrNull = (n) => (n > 0 ? String(n) : null)
    const tabs = [
      {
        id: "all",
        label: t.profile?.friends?.subTabs?.all || "Tất cả bạn bè",
        badge: badgeOrNull(friendsList.length),
      },
      {
        id: "following",
        label: t.profile?.friends?.subTabs?.following || "Đang theo dõi",
        badge: badgeOrNull(followingList.length),
      },
      {
        id: "followers",
        label: t.profile?.friends?.subTabs?.followers || "Người theo dõi",
        badge: badgeOrNull(followersList.length),
      },
    ]
    if (isOwnProfile) {
      tabs.push(
        {
          id: "pending",
          label: t.profile?.friends?.subTabs?.pending || "Yêu cầu kết nối",
          badge: badgeOrNull(pendingRequests.length),
        },
        {
          id: "find",
          label: t.profile?.friends?.subTabs?.find || "Tìm bạn bè",
        },
      )
    }
    return tabs
  }, [
    isOwnProfile,
    friendsList.length,
    followingList.length,
    followersList.length,
    pendingRequests.length,
    t,
  ])

  // Compute active list & loading state
  const isSearchingRecs =
    activeSubTab === "find" &&
    (searchQuery !== debouncedSearchQuery || (fetchingRecs && recPage === 1))

  const { list, isLoading, emptyMessage } = useMemo(() => {
    let raw = []
    let loading = false
    let empty = t.profile?.friends?.empty?.noData || "Không có dữ liệu"

    if (activeSubTab === "all") {
      raw = getArray(friendsRes)
      loading = loadingFriends
      empty = t.profile?.friends?.empty?.noFriends || "Chưa có bạn bè nào."
    } else if (activeSubTab === "following") {
      raw = getArray(followingRes)
      loading = loadingFollowing
      empty = t.profile?.friends?.empty?.noFollowing || "Chưa theo dõi ai."
    } else if (activeSubTab === "followers") {
      raw = getArray(followersRes)
      loading = loadingFollowers
      empty =
        t.profile?.friends?.empty?.noFollowers || "Chưa có người theo dõi."
    } else if (activeSubTab === "pending") {
      raw = pendingRequests.map((req) => ({
        ...req.requester,
        friendshipId: req.friendshipId,
        isPendingRequest: true,
      }))
      loading = loadingPending
      empty =
        t.profile?.friends?.empty?.noPending || "Không có yêu cầu kết nối nào."
    } else if (activeSubTab === "find") {
      raw = getArray(recRes)
      loading = (loadingRecs && recPage === 1) || isSearchingRecs
      empty =
        t.profile?.friends?.empty?.noRecommendations || "Không có gợi ý nào."
    }

    if (searchQuery.trim() && activeSubTab !== "find") {
      const q = normalize(searchQuery)
      raw = raw.filter(
        (u) =>
          normalize(u.username).includes(q) ||
          normalize(u.nickname).includes(q),
      )
    }

    if (searchQuery.trim() && raw.length === 0 && !loading) {
      const template =
        t.profile?.friends?.empty?.noSearchResults ||
        t.friends?.empty?.noSearchResults ||
        'Không tìm thấy kết quả phù hợp cho "{query}".'
      empty = template.replace("{query}", searchQuery.trim())
    }

    return { list: raw, isLoading: loading, emptyMessage: empty }
  }, [
    activeSubTab,
    friendsRes,
    loadingFriends,
    followingRes,
    loadingFollowing,
    followersRes,
    loadingFollowers,
    pendingRequests,
    loadingPending,
    recRes,
    loadingRecs,
    isSearchingRecs,
    recPage,
    searchQuery,
    t,
  ])

  return {
    activeSubTab,
    setActiveSubTab,
    subTabs,
    searchQuery,
    setSearchQuery,
    list,
    isLoading,
    emptyMessage,
    hasMore: activeSubTab === "find" && recRes?.hasMore !== false,
    fetchingRecs,
    bottomSentinelRef,
    followingIdSet,
  }
}

export default useProfileFriends
