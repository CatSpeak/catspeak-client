import React, { useState, useEffect } from "react"
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetPublicProfileQuery } from "@/store/api/userApi"
import { useGetFriendshipCountsQuery } from "../../../store/api/social/friendshipApi"

import SocialProfileHeader from "../components/SocialProfileHeader"
import Tabs, { TabContent } from "@/shared/components/ui/navigation/Tabs"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import ProfilePageSkeleton from "../components/ProfilePageSkeleton"
import ProfileHomeTab from "../components/ProfileHomeTab"
import ProfileMediaTab from "../components/ProfileMediaTab"
import ProfileFriendsTab from "../components/ProfileFriendsTab"
import ProfileMaterialsTab from "../components/ProfileMaterialsTab"
import CompletedClass from "../components/CompletedClass"

const ProfilePage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { accountId: urlAccountId } = useParams()

  // Since URL params are strings, ensure we convert accountId to number for comparison
  const targetAccountId = urlAccountId
    ? parseInt(urlAccountId, 10)
    : user?.accountId
  const isOwnProfile =
    !urlAccountId || parseInt(urlAccountId, 10) === user?.accountId

  useEffect(() => {
    if (!urlAccountId && user?.accountId) {
      navigate(`/workspace/profile/${user.accountId}${location.search}`, {
        replace: true,
      })
    }
  }, [urlAccountId, user, navigate, location.search])

  // Single centralized query for social profile (/api/Account/{id})
  const { data: publicProfileResponse, isLoading } = useGetPublicProfileQuery(
    targetAccountId,
    { skip: !targetAccountId },
  )

  const profile = publicProfileResponse?.data ?? publicProfileResponse ?? null

  // Lightweight counts for header badges. Lists are lazy-loaded inside ProfileFriendsTab.
  const {
    data: countsResponse,
    isError: isCountsError,
    refetch: refetchCounts,
  } = useGetFriendshipCountsQuery(
    targetAccountId,
    {
      skip: !targetAccountId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  )

  const counts = countsResponse?.data ?? countsResponse ?? null
  const friendsCount = isCountsError ? "—" : counts?.friends ?? counts?.Friends ?? 0
  const followersCount = isCountsError ? "—" : counts?.followers ?? counts?.Followers ?? 0
  const friendsBadge = !isCountsError && friendsCount > 0 ? friendsCount.toString() : null

  const [searchParams] = useSearchParams()
  const currentToken = searchParams.get("sharedMaterialToken")

  const [activeTab, setActiveTab] = useState(
    currentToken ? "documents" : "home",
  )
  const [friendsSubTab, setFriendsSubTab] = useState(null)

  const [prevToken, setPrevToken] = useState(currentToken)
  if (currentToken !== prevToken) {
    setPrevToken(currentToken)
    if (currentToken) {
      setActiveTab("documents")
    }
  }

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab)
  }

  if (isLoading) return <ProfilePageSkeleton />

  const tabs = [
    { id: "home", label: t.profile?.tabs?.home || "Nhà" },
    {
      id: "friends",
      label: t.profile?.tabs?.friends || "Bạn bè",
      badge: friendsBadge,
    },
    { id: "media", label: t.profile?.tabs?.media || "Video/Ảnh" },
    { id: "documents", label: t.profile?.tabs?.documents || "Tài liệu" },
    {
      id: "completedClass",
      label: t.profile?.tabs?.completedClass || "Lớp học đã hoàn thành",
    },
  ]

  return (
    <FluentAnimation
      duration={0.28}
      direction="up"
      distance={12}
      className="p-4 w-full min-h-[calc(100vh-70px)] bg-primaryBg dark:bg-[#0F0F0F]"
    >
      <div className="w-full max-w-[1200px] mx-auto flex flex-col relative z-10">
        {/* Top Header Section */}
        <SocialProfileHeader
          profile={profile}
          t={t}
          targetAccountId={targetAccountId}
          isOwnProfile={isOwnProfile}
          friendsCount={friendsCount}
          followersCount={followersCount}
        />

        {isCountsError && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300"
          >
            <span>Không thể tải số liệu bạn bè.</span>
            <button
              type="button"
              onClick={() => refetchCounts()}
              className="rounded-full border border-amber-300 dark:border-amber-800 px-3 py-1 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={false}
          className="overflow-x-auto scrollbar-hidden mb-4"
        />

        {/* Tab Content with M3 Motion Transition */}
        <TabContent
          activeTab={activeTab}
          tabs={tabs}
          className="w-full"
        >
          {activeTab === "home" && (
            <ProfileHomeTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
              onNavigateToFriends={(sub) => {
                setFriendsSubTab(sub)
                handleTabChange("friends")
              }}
            />
          )}
          {activeTab === "media" && (
            <ProfileMediaTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
            />
          )}
          {activeTab === "friends" && (
            <ProfileFriendsTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
              defaultSubTab={friendsSubTab}
            />
          )}
          {activeTab === "documents" && (
            <ProfileMaterialsTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
            />
          )}
          {activeTab === "completedClass" && (
            <CompletedClass
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
            />
          )}
        </TabContent>
      </div>
    </FluentAnimation>
  )
}

export default ProfilePage
