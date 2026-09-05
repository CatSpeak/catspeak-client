import React, { useCallback, useState } from "react"
import { User, Search, ListFilter, X } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import { useProfileFriends } from "../hooks/useProfileFriends"
import ProfileFriendCard from "./ProfileFriendCard"

const getAccountId = (u) => u?.accountId ?? u?.id ?? u?.userId

const ProfileFriendsTab = ({
  targetAccountId,
  isOwnProfile,
  defaultSubTab,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { user: authUser } = useAuth()
  const currentUserId = authUser?.accountId ?? authUser?.id ?? authUser?.userId

  const {
    activeSubTab,
    setActiveSubTab,
    subTabs,
    activeFilter,
    setActiveFilter,
    clearActiveFilter,
    filterActiveCount,
    list,
    pendingIncomingList,
    pendingOutgoingList,
    isLoading,
    emptyMessage,
    hasMore,
    fetchingRecs,
    bottomSentinelRef,
    followingIdSet,
    sentRequestIds,
    outgoingMap,
    markRequestSent,
    unmarkRequestSent,
  } = useProfileFriends({
    targetAccountId,
    isOwnProfile,
    defaultSubTab,
    currentUserId,
  })

  const [showFilter, setShowFilter] = useState(false)
  const [draft, setDraft] = useState(activeFilter)

  const openFilter = () => {
    setDraft(activeFilter)
    setShowFilter(true)
  }

  const navigateToProfile = useCallback(
    (accountId) => {
      const isWorkspace = location.pathname.startsWith("/workspace")
      navigate(`${isWorkspace ? "/workspace" : ""}/profile/${accountId}`)
    },
    [location.pathname, navigate],
  )

  const applyFilter = () => {
    setActiveFilter({ ...draft })
    setShowFilter(false)
  }

  const renderCard = (user, index, extra = {}) => {
    const accountId = getAccountId(user)
    const isFollowing = accountId != null && followingIdSet?.has(Number(accountId))
    const isSent = accountId != null && sentRequestIds?.has(Number(accountId))
    const mappedFriendshipId =
      accountId != null ? outgoingMap?.get(Number(accountId)) : undefined
    return (
      <ProfileFriendCard
        key={accountId ?? `row-${index}`}
        user={user}
        activeSubTab={extra.activeSubTabOverride ?? activeSubTab}
        isOwnProfile={isOwnProfile}
        currentUserId={currentUserId}
        isFollowing={isFollowing}
        isRequestSent={isSent}
        friendshipId={user?.friendshipId ?? mappedFriendshipId ?? extra.friendshipId}
        isOutgoingRequest={Boolean(extra.isOutgoingRequest || user?.isOutgoingRequest)}
        onRequestSent={markRequestSent}
        onRequestFailed={unmarkRequestSent}
        onNavigate={navigateToProfile}
      />
    )
  }

  const renderGrid = (items, extra = {}) => (
    <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {items.map((user, index) => renderCard(user, index, extra))}
    </div>
  )

  const isPendingTab = activeSubTab === "pending"

  return (
    <div className="w-full flex flex-col gap-4 min-h-[500px]">
      {/* Top Controls Bar: Sub-tab Pill Buttons + small filter button (no more full-width search) */}
      <div className="flex items-center justify-between gap-2">
        {/* Sub-tab Pill Buttons (horizontal scroll on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden flex-1 min-w-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {subTabs.map((tab) => {
            const tabKey = tab.id ?? tab.value
            const isActive = activeSubTab === tabKey
            const Icon = tab.icon

            return (
              <PillButton
                key={tabKey}
                variant={isActive ? "primary" : "secondary"}
                onClick={() => setActiveSubTab(tabKey)}
                startIcon={Icon ? <Icon /> : null}
                className="shrink-0"
              >
                {tab.label}
                {tab.badge != null && (
                  <span
                    className={`ml-1 inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </PillButton>
            )
          })}
        </div>

        {/* Small filter button with active-count badge */}
        <div className="relative shrink-0">
          <IconButton
            title={t.profile?.friends?.filter || "Bộ lọc"}
            size="md"
            variant={filterActiveCount > 0 ? "primary" : "secondary"}
            onClick={() => (showFilter ? setShowFilter(false) : openFilter())}
            className="relative"
          >
            <ListFilter />
            {filterActiveCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                {filterActiveCount}
              </span>
            )}
          </IconButton>

          {showFilter && (
            <>
              {/* Mobile backdrop */}
              <div
                className="fixed inset-0 bg-black/30 z-40 sm:hidden"
                onClick={() => setShowFilter(false)}
              />
              {/* Panel: bottom-sheet on mobile, popover on desktop */}
              <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border border-border p-4 shadow-xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:rounded-xl sm:z-30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">
                    {t.profile?.friends?.filterTitle || "Lọc bạn bè"}
                  </h4>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-600">{t.profile?.friends?.searchPlaceholder || "Tìm kiếm (tên...)"}</span>
                    <input
                      value={draft.keyword || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
                      placeholder={t.profile?.friends?.searchPlaceholder || "Tìm kiếm bạn bè..."}
                      className="h-10 px-3 rounded-lg border border-border outline-none focus:border-gray-400"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-600">{t.profile?.friends?.accountType || "Vai trò"}</span>
                    <select
                      value={draft.accountType || "all"}
                      onChange={(e) => setDraft((d) => ({ ...d, accountType: e.target.value }))}
                      className="h-10 px-2 rounded-lg border border-border bg-white outline-none"
                    >
                      <option value="all">{t.profile?.friends?.allRoles || "Tất cả"}</option>
                      <option value="teacher">{t.profile?.friends?.teacher || "Giảng viên"}</option>
                      <option value="student">{t.profile?.friends?.member || "Thành viên"}</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-gray-600">Level</span>
                    <input
                      value={draft.level || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))}
                      placeholder="vd: N5, N4..."
                      className="h-10 px-3 rounded-lg border border-border outline-none focus:border-gray-400"
                    />
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <PillButton variant="secondary" className="flex-1" onClick={() => { clearActiveFilter(); setDraft({ keyword: "", accountType: "all", level: "" }); setShowFilter(false) }}>
                      {t.profile?.friends?.clearFilter || "Xóa lọc"}
                    </PillButton>
                    <PillButton variant="primary" className="flex-1" onClick={applyFilter}>
                      {t.profile?.friends?.applyFilter || "Áp dụng"}
                    </PillButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid / List Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex flex-row sm:flex-col items-center sm:items-stretch p-3 sm:p-0 gap-3.5 sm:gap-0 overflow-hidden rounded-xl bg-white border border-border/80"
              >
                <Skeleton className="w-12 h-12 shrink-0 rounded-full sm:w-full sm:h-auto sm:aspect-square sm:rounded-none" />
                <div className="flex-1 min-w-0 sm:p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                  <Skeleton className="hidden sm:block h-8 w-full rounded-lg mt-2" />
                </div>
                <div className="sm:hidden shrink-0">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isPendingTab ? (
          <div className="flex flex-col gap-6">
            <section>
              <h4 className="font-semibold text-sm mb-2">
                {t.profile?.friends?.pendingIncoming || "Chờ bạn duyệt"} ({pendingIncomingList.length})
              </h4>
              {pendingIncomingList.length === 0 ? (
                <FluentCard>
                  <EmptyState message={t.profile?.friends?.empty?.noPending || "Không có yêu cầu nào."} icon={User} />
                </FluentCard>
              ) : (
                renderGrid(pendingIncomingList)
              )}
            </section>
            <section>
              <h4 className="font-semibold text-sm mb-2">
                {t.profile?.friends?.pendingOutgoing || "Bạn đã gửi"} ({pendingOutgoingList.length})
              </h4>
              {pendingOutgoingList.length === 0 ? (
                <FluentCard>
                  <EmptyState message={t.profile?.friends?.empty?.noSent || "Chưa gửi lời mời nào."} icon={User} />
                </FluentCard>
              ) : (
                renderGrid(pendingOutgoingList, { isOutgoingRequest: true, activeSubTabOverride: "pending" })
              )}
            </section>
            {hasMore && <div ref={bottomSentinelRef} className="h-4 w-full" />}
          </div>
        ) : list.length === 0 ? (
          <FluentCard>
            <EmptyState
              message={emptyMessage}
              icon={(activeFilter.keyword || "").trim() ? Search : User}
            />
          </FluentCard>
        ) : (
          <>
            {renderGrid(list)}
            {hasMore && <div ref={bottomSentinelRef} className="h-4 w-full" />}
            {fetchingRecs && (
              <div className="text-center text-sm text-gray-500 py-2">...</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileFriendsTab
