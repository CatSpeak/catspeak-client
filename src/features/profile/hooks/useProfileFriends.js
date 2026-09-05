import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import useDebounce from "@/shared/hooks/useDebounce"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetPendingFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useGetFriendRecommendationsQuery,
  useGetFriendshipCountsQuery,
} from "@/store/api/social/friendshipApi"

const PAGE_SIZE = 20
const MIN_KEYWORD_LENGTH = 2

const getArray = (res) => (Array.isArray(res) ? res : res?.data || [])
const getAccountId = (u) => u?.accountId ?? u?.id ?? u?.userId

const toServerKeyword = (q) => {
  const trimmed = (q || "").trim()
  return trimmed.length >= MIN_KEYWORD_LENGTH ? trimmed : undefined
}

const toServerIsTeacher = (accountType) => {
  if (accountType === "teacher") return true
  if (accountType === "student") return false
  return undefined
}

const EMPTY_FILTER = { keyword: "", accountType: "all", level: "" }

export const useProfileFriends = ({
  targetAccountId,
  isOwnProfile,
  defaultSubTab,
  currentUserId,
}) => {
  const { t } = useLanguage()
  const [rawActiveSubTab, setActiveSubTab] = useState(defaultSubTab || "all")
  // Derive effective tab without cascading setState in effect:
  // external profiles can't access pending/find; fall back to "all" for queries/render.
  const activeSubTab =
    !isOwnProfile && (rawActiveSubTab === "pending" || rawActiveSubTab === "find")
      ? "all"
      : rawActiveSubTab
  const [filtersByTab, setFiltersByTab] = useState({})
  const [pagesByTab, setPagesByTab] = useState({ all: 1, following: 1, followers: 1, pending: 1, find: 1 })
  const bottomSentinelRef = useRef(null)

  // Optimistic sent (survives refetch within session; reload persistence via outgoing API).
  const [optimisticSentIds, setOptimisticSentIds] = useState(() => new Set())

  const activeFilter = filtersByTab[activeSubTab] || EMPTY_FILTER
  const debouncedKeyword = useDebounce(activeFilter.keyword || "", 300)
  const serverKeyword = toServerKeyword(debouncedKeyword)
  const serverIsTeacher = toServerIsTeacher(activeFilter.accountType)
  const serverLevel = (activeFilter.level || "").trim() || undefined

  const setActiveFilter = useCallback(
    (patch) => {
      setFiltersByTab((prev) => ({
        ...prev,
        [activeSubTab]: { ...(prev[activeSubTab] || EMPTY_FILTER), ...patch },
      }))
      // Reset page when filter changes
      setPagesByTab((prev) => ({ ...prev, [activeSubTab]: 1 }))
    },
    [activeSubTab],
  )

  const clearActiveFilter = useCallback(() => {
    setFiltersByTab((prev) => ({ ...prev, [activeSubTab]: { ...EMPTY_FILTER } }))
    setPagesByTab((prev) => ({ ...prev, [activeSubTab]: 1 }))
  }, [activeSubTab])

  const filterActiveCount = useMemo(() => {
    let n = 0
    if ((activeFilter.keyword || "").trim()) n += 1
    if (activeFilter.accountType && activeFilter.accountType !== "all") n += 1
    if ((activeFilter.level || "").trim()) n += 1
    return n
  }, [activeFilter])

  // Reset restricted tab on external profile: handled via derived activeSubTab above (no effect).

  // Per-tab page memory; missing entries fall back to 1 via `|| 1` at usage sites.

  // Counts: always loaded for own profile (1 light call for all badges).
  // No polling; refetch on focus + after mutations via invalidation.
  const { data: countsRes } = useGetFriendshipCountsQuery(undefined, {
    skip: !isOwnProfile,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const counts = countsRes?.data ?? countsRes ?? null

  // Lazy lists: only active tab subscribes.
  const friendsArgs = useMemo(
    () => ({
      accountId: targetAccountId,
      searchKeyword: serverKeyword,
      isTeacher: serverIsTeacher,
      level: serverLevel,
      page: pagesByTab.all || 1,
      pageSize: PAGE_SIZE,
    }),
    [targetAccountId, serverKeyword, serverIsTeacher, serverLevel, pagesByTab.all],
  )
  const followingArgs = useMemo(
    () => ({
      accountId: targetAccountId,
      searchKeyword: serverKeyword,
      isTeacher: serverIsTeacher,
      level: serverLevel,
      page: pagesByTab.following || 1,
      pageSize: PAGE_SIZE,
    }),
    [targetAccountId, serverKeyword, serverIsTeacher, serverLevel, pagesByTab.following],
  )
  const followersArgs = useMemo(
    () => ({
      accountId: targetAccountId,
      searchKeyword: serverKeyword,
      isTeacher: serverIsTeacher,
      level: serverLevel,
      page: pagesByTab.followers || 1,
      pageSize: PAGE_SIZE,
    }),
    [targetAccountId, serverKeyword, serverIsTeacher, serverLevel, pagesByTab.followers],
  )
  const pendingArgs = useMemo(
    () => ({
      searchKeyword: serverKeyword,
      isTeacher: serverIsTeacher,
      level: serverLevel,
      page: pagesByTab.pending || 1,
      pageSize: PAGE_SIZE,
    }),
    [serverKeyword, serverIsTeacher, serverLevel, pagesByTab.pending],
  )
  const recArgs = useMemo(
    () => ({
      searchKeyword: serverKeyword,
      isTeacher: serverIsTeacher,
      level: serverLevel,
      page: pagesByTab.find || 1,
      pageSize: PAGE_SIZE,
    }),
    [serverKeyword, serverIsTeacher, serverLevel, pagesByTab.find],
  )

  const { data: friendsRes, isLoading: loadingFriends, isFetching: fetchingFriends } = useGetFriendsQuery(friendsArgs, {
    skip: !targetAccountId || activeSubTab !== "all",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: followingRes, isLoading: loadingFollowing, isFetching: fetchingFollowing } = useGetFollowingQuery(followingArgs, {
    skip: !targetAccountId || activeSubTab !== "following",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: followersRes, isLoading: loadingFollowers, isFetching: fetchingFollowers } = useGetFollowersQuery(followersArgs, {
    skip: !targetAccountId || activeSubTab !== "followers",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: pendingRes, isLoading: loadingPending, isFetching: fetchingPending } = useGetPendingFriendRequestsQuery(pendingArgs, {
    skip: !isOwnProfile || activeSubTab !== "pending",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: sentRes, isLoading: loadingSent, isFetching: fetchingSent } = useGetSentFriendRequestsQuery(pendingArgs, {
    skip: !isOwnProfile || (activeSubTab !== "pending" && activeSubTab !== "find"),
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: recRes, isLoading: loadingRecs, isFetching: fetchingRecs } = useGetFriendRecommendationsQuery(recArgs, {
    skip: !isOwnProfile || activeSubTab !== "find",
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // My following for cross-check on other people's profiles (small, single page).
  const { data: myFollowingRes } = useGetFollowingQuery(
    { accountId: currentUserId, page: 1, pageSize: 100 },
    { skip: isOwnProfile || !currentUserId },
  )

  const friendsList = useMemo(() => getArray(friendsRes), [friendsRes])
  const followingList = useMemo(() => getArray(followingRes), [followingRes])
  const followersList = useMemo(() => getArray(followersRes), [followersRes])
  const myFollowingList = useMemo(() => getArray(myFollowingRes), [myFollowingRes])

  const pendingIncomingList = useMemo(() => {
    const raw = getArray(pendingRes)
    return raw.map((req) => {
      if (req?.requester) {
        return { ...req.requester, friendshipId: req.friendshipId, isPendingRequest: true, pendingCreateDate: req.createDate ?? req.CreateDate }
      }
      return { ...req, isPendingRequest: true }
    })
  }, [pendingRes])

  const pendingOutgoingList = useMemo(() => {
    const raw = getArray(sentRes)
    return raw.map((req) => {
      const addr = req?.addressee ?? req?.Addressee ?? req
      return {
        ...addr,
        friendshipId: req.friendshipId ?? req.FriendshipId ?? addr?.friendshipId,
        isOutgoingRequest: true,
        pendingCreateDate: req.createDate ?? req.CreateDate ?? req.createDate,
      }
    })
  }, [sentRes])

  // Server-persistent outgoing map: accountId -> friendshipId (survives reload).
  const outgoingMap = useMemo(() => {
    const map = new Map()
    for (const u of pendingOutgoingList) {
      const id = getAccountId(u)
      if (id != null && u?.friendshipId != null) map.set(Number(id), u.friendshipId)
    }
    return map
  }, [pendingOutgoingList])

  const sentRequestIds = useMemo(() => {
    const set = new Set(outgoingMap.keys())
    for (const id of optimisticSentIds) set.add(Number(id))
    return set
  }, [outgoingMap, optimisticSentIds])

  const followingIdSet = useMemo(() => {
    const source = isOwnProfile ? followingList : myFollowingList
    // When own following tab hasn't loaded yet (lazy), followingList is empty;
    // fall back to empty set (cards will show Follow state until loaded).
    const set = new Set()
    for (const u of source) {
      const id = getAccountId(u)
      if (id != null) set.add(Number(id))
    }
    return set
  }, [isOwnProfile, followingList, myFollowingList])

  // Badges: counts for own profile (no list needed); fallback to loaded lengths for external profiles.
  const subTabs = useMemo(() => {
    const badgeOrNull = (n) => (n != null && n > 0 ? String(n) : null)
    let allBadge; let followingBadge; let followersBadge; let pendingBadge
    if (isOwnProfile && counts) {
      allBadge = badgeOrNull(counts.friends ?? counts.Friends)
      followingBadge = badgeOrNull(counts.following ?? counts.Following)
      followersBadge = badgeOrNull(counts.followers ?? counts.Followers)
      const incoming = counts.pendingIncoming ?? counts.PendingIncoming ?? 0
      const outgoing = counts.pendingOutgoing ?? counts.PendingOutgoing ?? 0
      pendingBadge = badgeOrNull((incoming || 0) + (outgoing || 0))
    } else {
      allBadge = badgeOrNull(friendsList.length) ?? (activeSubTab === "all" ? null : badgeOrNull(friendsList.length))
      followingBadge = badgeOrNull(followingList.length)
      followersBadge = badgeOrNull(followersList.length)
      pendingBadge = badgeOrNull(pendingIncomingList.length + pendingOutgoingList.length)
    }
    const tabs = [
      { id: "all", label: t.profile?.friends?.subTabs?.all || "Tất cả bạn bè", badge: allBadge },
      { id: "following", label: t.profile?.friends?.subTabs?.following || "Đang theo dõi", badge: followingBadge },
      { id: "followers", label: t.profile?.friends?.subTabs?.followers || "Người theo dõi", badge: followersBadge },
    ]
    if (isOwnProfile) {
      tabs.push(
        { id: "pending", label: t.profile?.friends?.subTabs?.pending || "Yêu cầu kết nối", badge: pendingBadge },
        { id: "find", label: t.profile?.friends?.subTabs?.find || "Tìm bạn bè" },
      )
    }
    return tabs
  }, [isOwnProfile, counts, friendsList.length, followingList.length, followersList.length, pendingIncomingList.length, pendingOutgoingList.length, t, activeSubTab])

  const { list, isLoading, emptyMessage, hasMore, isFetchingMore } = useMemo(() => {
    let raw = []
    let loading = false
    let fetchingMore = false
    let hasMore = false
    let empty = t.profile?.friends?.empty?.noData || "Không có dữ liệu"

    if (activeSubTab === "all") {
      raw = friendsList
      loading = loadingFriends && friendsList.length === 0
      fetchingMore = fetchingFriends && friendsList.length > 0
      hasMore = friendsRes?.hasMore ?? (friendsList.length >= PAGE_SIZE)
      empty = t.profile?.friends?.empty?.noFriends || "Chưa có bạn bè nào."
    } else if (activeSubTab === "following") {
      raw = followingList
      loading = loadingFollowing && followingList.length === 0
      fetchingMore = fetchingFollowing && followingList.length > 0
      hasMore = followingRes?.hasMore ?? (followingList.length >= PAGE_SIZE)
      empty = t.profile?.friends?.empty?.noFollowing || "Chưa theo dõi ai."
    } else if (activeSubTab === "followers") {
      raw = followersList
      loading = loadingFollowers && followersList.length === 0
      fetchingMore = fetchingFollowers && followersList.length > 0
      hasMore = followersRes?.hasMore ?? (followersList.length >= PAGE_SIZE)
      empty = t.profile?.friends?.empty?.noFollowers || "Chưa có người theo dõi."
    } else if (activeSubTab === "pending") {
      // Pending renders two sections; list here is incoming for backward compat.
      raw = pendingIncomingList
      loading = (loadingPending || loadingSent) && pendingIncomingList.length === 0 && pendingOutgoingList.length === 0
      fetchingMore = (fetchingPending || fetchingSent) && (pendingIncomingList.length > 0 || pendingOutgoingList.length > 0)
      const incomingHasMore = pendingRes?.hasMore ?? (pendingIncomingList.length >= PAGE_SIZE)
      const outgoingHasMore = sentRes?.hasMore ?? (pendingOutgoingList.length >= PAGE_SIZE)
      hasMore = Boolean(incomingHasMore || outgoingHasMore)
      empty = t.profile?.friends?.empty?.noPending || "Không có yêu cầu kết nối nào."
    } else if (activeSubTab === "find") {
      raw = getArray(recRes)
      const isSearching = debouncedKeyword !== (activeFilter.keyword || "")
      loading = (loadingRecs && raw.length === 0) || (isSearching && raw.length === 0)
      fetchingMore = fetchingRecs && raw.length > 0
      hasMore = recRes?.hasMore ?? (raw.length >= PAGE_SIZE)
      empty = t.profile?.friends?.empty?.noRecommendations || "Không có gợi ý nào."
    }

    if ((activeFilter.keyword || "").trim() && activeSubTab !== "find" && activeSubTab !== "pending" && activeSubTab !== "all" && activeSubTab !== "following" && activeSubTab !== "followers") {
      // All server-filtered now; no client filtering.
    }

    if (((activeFilter.keyword || "").trim() || filterActiveCount > 0) && raw.length === 0 && !loading) {
      const template =
        t.profile?.friends?.empty?.noSearchResults ||
        t.friends?.empty?.noSearchResults ||
        'Không tìm thấy kết quả phù hợp cho "{query}".'
      const q = (activeFilter.keyword || "").trim() || "bộ lọc hiện tại"
      empty = template.replace("{query}", q)
    }

    return { list: raw, isLoading: loading, emptyMessage: empty, hasMore, isFetchingMore: fetchingMore }
  }, [
    activeSubTab, friendsList, followingList, followersList, pendingIncomingList, pendingOutgoingList,
    loadingFriends, loadingFollowing, loadingFollowers, loadingPending, loadingSent, loadingRecs,
    fetchingFriends, fetchingFollowing, fetchingFollowers, fetchingPending, fetchingSent, fetchingRecs,
    friendsRes, followingRes, followersRes, pendingRes, sentRes, recRes,
    activeFilter, debouncedKeyword, filterActiveCount, t,
  ])

  // Infinite scroll: any tab with hasMore.
  useEffect(() => {
    if (!bottomSentinelRef.current) return
    if (!hasMore || isFetchingMore || isLoading) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPagesByTab((prev) => ({ ...prev, [activeSubTab]: (prev[activeSubTab] || 1) + 1 }))
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(bottomSentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, isLoading, activeSubTab, list.length])

  return {
    activeSubTab,
    setActiveSubTab,
    subTabs,
    // New filter API
    activeFilter,
    setActiveFilter,
    clearActiveFilter,
    filterActiveCount,
    // Backward-compat search (single keyword) for existing UI
    searchQuery: activeFilter.keyword || "",
    setSearchQuery: (v) => setActiveFilter({ keyword: typeof v === "string" ? v : v?.target?.value ?? "" }),
    list,
    pendingIncomingList,
    pendingOutgoingList,
    isLoading,
    emptyMessage,
    hasMore,
    fetchingRecs: isFetchingMore,
    bottomSentinelRef,
    followingIdSet,
    sentRequestIds,
    outgoingMap,
    counts,
    markRequestSent: (accountId) => {
      if (accountId == null) return
      setOptimisticSentIds((prev) => new Set(prev).add(Number(accountId)))
    },
    unmarkRequestSent: (accountId) => {
      if (accountId == null) return
      setOptimisticSentIds((prev) => {
        const next = new Set(prev)
        next.delete(Number(accountId))
        return next
      })
    },
  }
}

export default useProfileFriends
