import React, { useCallback, useState } from "react"
import { User, Search, ListFilter } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import { useProfileFriends } from "../hooks/useProfileFriends"
import ProfileFriendCard from "./ProfileFriendCard"
import ProfileFriendsFilterModal from "./ProfileFriendsFilterModal"
import ChipFilter from "@/shared/components/ChipFilter"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"

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
    markFollowed,
    markUnfollowed,
  } = useProfileFriends({
    targetAccountId,
    isOwnProfile,
    defaultSubTab,
    currentUserId,
  })

  const [showFilter, setShowFilter] = useState(false)

  const navigateToProfile = useCallback(
    (accountId) => {
      navigate(`/workspace/profile/${accountId}`)
    },
    [navigate],
  )

  const renderCard = (user, index, extra = {}) => {
    const accountId = getAccountId(user)
    const isFollowing =
      accountId != null && followingIdSet?.has(Number(accountId))
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
        friendshipId={
          user?.friendshipId ?? mappedFriendshipId ?? extra.friendshipId
        }
        isOutgoingRequest={Boolean(
          extra.isOutgoingRequest || user?.isOutgoingRequest,
        )}
        onRequestSent={markRequestSent}
        onRequestFailed={unmarkRequestSent}
        onFollowed={markFollowed}
        onUnfollowed={markUnfollowed}
        onNavigate={navigateToProfile}
      />
    )
  }

  const renderGrid = (items, extra = {}) => (
    <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {items.map((user, index) => renderCard(user, index, extra))}
    </div>
  )

  const isPendingTab = activeSubTab === "pending"
  const modalFilterCount =
    (activeFilter.accountType && activeFilter.accountType !== "all" ? 1 : 0) +
    ((activeFilter.level || "").trim() ? 1 : 0)

  return (
    <div className="w-full flex flex-col gap-4 min-h-[500px]">
      {/* Search and filter controls */}
      <div className="relative shrink-0">
        {/* Row 1: Search input + Filter button */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="w-full max-w-[360px]">
            <SearchInput
              value={activeFilter.keyword || ""}
              onChange={(val) => setActiveFilter({ keyword: val })}
              onClear={() => setActiveFilter({ keyword: "" })}
              placeholder={
                t.profile?.friends?.searchPlaceholder || "Tìm kiếm bạn bè..."
              }
            />
          </div>

          <PillButton
            title={t.profile?.friends?.filter || "Bộ lọc"}
            variant={modalFilterCount > 0 ? "primary" : "secondary"}
            onClick={() => setShowFilter(true)}
            startIcon={<ListFilter />}
            className="relative shrink-0"
          >
            {t.profile?.friends?.filter || "Bộ lọc"}

            {modalFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                {modalFilterCount}
              </span>
            )}
          </PillButton>
        </div>

        {/* Row 2: ChipFilter */}
        <ChipFilter
          options={subTabs.map((tab) => {
            const Icon = tab.icon

            return {
              key: tab.id ?? tab.value,
              label: tab.label,
              icon: Icon ? <Icon /> : undefined,
              count: tab.badge != null ? Number(tab.badge) : undefined,
            }
          })}
          value={activeSubTab}
          onChange={setActiveSubTab}
          wrap={false}
          wrapDesktop={true}
        />

        <ProfileFriendsFilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          initialFilters={activeFilter}
          onApply={setActiveFilter}
          onClear={clearActiveFilter}
        />
      </div>

      {/* Grid / List Content */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="flex flex-row sm:flex-col items-center sm:items-stretch p-3 sm:p-0 gap-3.5 sm:gap-0 overflow-hidden rounded-xl bg-white dark:bg-[#1A1A1A] border border-border/80 dark:border-[#3F3F3F]"
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
          <div className="flex flex-col gap-4">
            <section>
              <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                {t.profile?.friends?.pendingIncoming || "Chờ bạn duyệt"} (
                {pendingIncomingList.length})
              </h4>
              {pendingIncomingList.length === 0 ? (
                <FluentCard>
                  <EmptyState
                    message={
                      t.profile?.friends?.empty?.noPending ||
                      "Không có yêu cầu nào."
                    }
                    icon={User}
                  />
                </FluentCard>
              ) : (
                renderGrid(pendingIncomingList)
              )}
            </section>
            <section>
              <h4 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                {t.profile?.friends?.pendingOutgoing || "Bạn đã gửi"} (
                {pendingOutgoingList.length})
              </h4>
              {pendingOutgoingList.length === 0 ? (
                <FluentCard>
                  <EmptyState
                    message={
                      t.profile?.friends?.empty?.noSent ||
                      "Chưa gửi lời mời nào."
                    }
                    icon={User}
                  />
                </FluentCard>
              ) : (
                renderGrid(pendingOutgoingList, {
                  isOutgoingRequest: true,
                  activeSubTabOverride: "pending",
                })
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
              <div className="text-center text-sm text-gray-500 dark:text-[#AAAAAA] py-2">
                ...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileFriendsTab
