import React, { useCallback } from "react"
import { User, Search } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import FluentCard from "@/shared/components/ui/FluentCard"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { Skeleton, EmptyState } from "@/shared/components/ui/indicators"
import { useProfileFriends } from "../hooks/useProfileFriends"
import ProfileFriendCard from "./ProfileFriendCard"

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
    searchQuery,
    setSearchQuery,
    list,
    isLoading,
    emptyMessage,
    hasMore,
    fetchingRecs,
    bottomSentinelRef,
    followingIdSet,
    sentRequestIds,
    markRequestSent,
    unmarkRequestSent,
  } = useProfileFriends({
    targetAccountId,
    isOwnProfile,
    defaultSubTab,
    currentUserId,
  })

  const navigateToProfile = useCallback(
    (accountId) => {
      const isWorkspace = location.pathname.startsWith("/workspace")
      navigate(`${isWorkspace ? "/workspace" : ""}/profile/${accountId}`)
    },
    [location.pathname, navigate],
  )

  return (
    <div className="w-full flex flex-col gap-4 min-h-[500px]">
      {/* Top Controls Bar: Sub-tab Pill Buttons & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Sub-tab Pill Buttons (horizontal scroll off-screen on mobile & iPad) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
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

        {/* Search Input (Full width on mobile, fixed width on tablet and above) */}
        <div className="w-full sm:w-72 shrink-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              t.profile?.friends?.searchPlaceholder || "Tìm kiếm bạn bè..."
            }
            className="w-full"
          />
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
        ) : list.length === 0 ? (
          <FluentCard>
            <EmptyState
              message={emptyMessage}
              icon={searchQuery.trim() ? Search : User}
            />
          </FluentCard>
        ) : (
          <>
            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {list.map((user, index) => {
                const accountId =
                  user.accountId ?? user.id ?? user.userId ?? user.friendshipId
                const isFollowing =
                  accountId != null && followingIdSet?.has(Number(accountId))
                const isRequestSent =
                  accountId != null && sentRequestIds?.has(Number(accountId))
                return (
                  <ProfileFriendCard
                    key={accountId ?? `row-${index}`}
                    user={user}
                    activeSubTab={activeSubTab}
                    isOwnProfile={isOwnProfile}
                    currentUserId={currentUserId}
                    isFollowing={isFollowing}
                    isRequestSent={isRequestSent}
                    onRequestSent={markRequestSent}
                    onRequestFailed={unmarkRequestSent}
                    onNavigate={navigateToProfile}
                  />
                )
              })}

              {/* Skeletons when fetching additional pages */}
              {hasMore &&
                fetchingRecs &&
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={`loading-more-${i}`}
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

            {/* Bottom sentinel trigger for infinite scroll */}
            {hasMore && <div ref={bottomSentinelRef} className="h-4 w-full" />}
          </>
        )}
      </div>
    </div>
  )
}

export default ProfileFriendsTab
