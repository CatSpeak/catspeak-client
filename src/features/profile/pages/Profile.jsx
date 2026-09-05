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
import {
  useGetFriendshipCountsQuery,
} from "../../../store/api/social/friendshipApi"

import SocialProfileHeader from "../components/SocialProfileHeader"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import ProfilePageSkeleton from "../components/ProfilePageSkeleton"
import ProfileHomeTab from "../components/ProfileHomeTab"
import ProfileMediaTab from "../components/ProfileMediaTab"
import ProfileFriendsTab from "../components/ProfileFriendsTab"
import ProfileMaterialsTab from "../components/ProfileMaterialsTab"
import CompletedClass from "../components/CompletedClass"

const Profile = () => {
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
      const isWorkspace = location.pathname.startsWith("/workspace")
      navigate(
        `${isWorkspace ? "/workspace/profile" : "/profile"}/${user.accountId}${location.search}`,
        { replace: true },
      )
    }
  }, [urlAccountId, user, navigate, location.pathname, location.search])

  // Single centralized query for social profile (/api/Account/{id})
  const { data: publicProfileResponse, isLoading } = useGetPublicProfileQuery(
    targetAccountId,
    { skip: !targetAccountId },
  )

  const profile = publicProfileResponse?.data ?? publicProfileResponse ?? null

  // Lightweight counts for header badges. Lists are lazy-loaded inside ProfileFriendsTab.
  // No polling; refetch on focus + after mutations via invalidation.
  const { data: countsResponse } = useGetFriendshipCountsQuery(undefined, {
    skip: !isOwnProfile,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  const counts = countsResponse?.data ?? countsResponse ?? null
  const friendsCount = counts?.friends ?? counts?.Friends ?? 0
  const followersCount = counts?.followers ?? counts?.Followers ?? 0
  const pendingCount =
    (counts?.pendingIncoming ?? counts?.PendingIncoming ?? 0) +
    (counts?.pendingOutgoing ?? counts?.PendingOutgoing ?? 0)

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

  if (isLoading) return <ProfilePageSkeleton />

  const tabs = [
    { id: "home", label: t.profile?.tabs?.home || "Nhà" },
    {
      id: "friends",
      label: t.profile?.tabs?.friends || "Bạn bè",
      badge: pendingCount > 0 ? pendingCount.toString() : null,
    },
    { id: "media", label: t.profile?.tabs?.media || "Video/Ảnh" },
    { id: "documents", label: t.profile?.tabs?.documents || "Tài liệu" },
    {
      id: "completedClass",
      label: t.profile?.tabs?.completedClass || "Lớp học đã hoàn thành",
    },
  ]

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-primaryBg">
      <FluentAnimation
        duration={0.28}
        direction="up"
        distance={12}
        className="w-full max-w-[1200px] mx-auto flex flex-col relative z-10"
      >
        {/* Top Header Section */}
        <SocialProfileHeader
          profile={profile}
          t={t}
          targetAccountId={targetAccountId}
          isOwnProfile={isOwnProfile}
          friendsCount={friendsCount}
          followersCount={followersCount}
        />

        {/* Tab Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          fullWidth={false}
          className="overflow-x-auto scrollbar-hidden mb-6"
        />

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === "home" && (
            <ProfileHomeTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
              onNavigateToFriends={(sub) => {
                setFriendsSubTab(sub)
                setActiveTab("friends")
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
        </div>
      </FluentAnimation>
    </div>
  )
}

export default Profile
