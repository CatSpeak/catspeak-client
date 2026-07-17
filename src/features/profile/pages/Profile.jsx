import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetUserProfileQuery,
  useGetPublicProfileQuery,
} from "@/store/api/userApi"
import { useProfileState } from "../../user/hooks/useProfileState"
import { useProfileMutations } from "../../user/hooks/useProfileMutations"
import {
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetPendingFriendRequestsQuery,
} from "../../../store/api/social/friendshipApi"

import SocialProfileHeader from "../components/SocialProfileHeader"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import ProfileHomeTab from "../components/ProfileHomeTab"
import ProfileMediaTab from "../components/ProfileMediaTab"
import ProfileFriendsTab from "../components/ProfileFriendsTab"
import ProfileDocumentsTab from "../components/ProfileDocumentsTab"
import PageTitle from "@/shared/components/ui/PageTitle"
import ProfileAboutTab from "../components/ProfileAboutTab"
import ProfileOtpModal from "../../user/components/ProfileOtpModal"
import { countries } from "@/shared/constants/countriesData"

const Profile = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { accountId: urlAccountId } = useParams()
  // Since URL params are strings, ensure we convert accountId to number for comparison
  const targetAccountId = urlAccountId
    ? parseInt(urlAccountId, 10)
    : user?.accountId
  const isOwnProfile =
    !urlAccountId || parseInt(urlAccountId, 10) === user?.accountId

  // Fetch private profile if own profile, otherwise skip
  const { data: privateProfileData, isLoading: loadingPrivate } =
    useGetUserProfileQuery(undefined, { skip: !isOwnProfile })
  // Fetch public profile if viewing someone else
  const { data: publicProfileResponse, isLoading: loadingPublic } =
    useGetPublicProfileQuery(targetAccountId, { skip: isOwnProfile })

  const profileData = isOwnProfile ? privateProfileData : publicProfileResponse
  const isLoading = isOwnProfile ? loadingPrivate : loadingPublic

  // Fetch Friendship Data
  const { data: friendsResponse } = useGetFriendsQuery(targetAccountId, {
    skip: !targetAccountId,
  })
  const { data: followersResponse } = useGetFollowersQuery(targetAccountId, {
    skip: !targetAccountId,
  })
  const { data: pendingResponse } = useGetPendingFriendRequestsQuery(
    undefined,
    { skip: !isOwnProfile },
  )

  const friendsCount = Array.isArray(friendsResponse)
    ? friendsResponse.length
    : friendsResponse?.data?.length || 0
  const followersCount = Array.isArray(followersResponse)
    ? followersResponse.length
    : followersResponse?.data?.length || 0
  const pendingCount = Array.isArray(pendingResponse)
    ? pendingResponse.length
    : pendingResponse?.data?.length || 0

  const [activeTab, setActiveTab] = useState("home")
  const [friendsSubTab, setFriendsSubTab] = useState(null)

  const stateHooks = useProfileState(profileData)
  const mutationHooks = useProfileMutations(t, profileData, stateHooks)

  const {
    formData,
    editingField,
    errors,
    isOtpModalOpen,
    setIsOtpModalOpen,
    handleEdit,
    handleCancel,
    handleChange,
  } = stateHooks

  const {
    isUpdating,
    isUpdatingPhone,
    isSendingOtp,
    isSendingPhoneOtp,
    handleSave,
    handleOtpVerify,
    handleOtpResend,
    handleCountryChange,
    handleUpdateAvatarFile,
  } = mutationHooks

  if (isLoading) return <div>Loading...</div>

  // Use avatarImageUrl as the primary avatar for the profile
  const displayAvatarUrl = formData.avatarImageUrl

  const tabs = [
    { id: "home", label: "Nhà" },
    {
      id: "friends",
      label: "Bạn bè",
      badge: pendingCount > 0 ? pendingCount.toString() : null,
    },
    { id: "media", label: "Video/Ảnh" },
    { id: "documents", label: "Tài liệu" },
    { id: "about", label: "Giới thiệu" },
  ]

  return (
    <div className="w-full min-h-[calc(100vh-70px)] p-4 sm:p-6 bg-[#f5f6f7]">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col relative z-10">
        {/* Top Header Section */}
        <SocialProfileHeader
          user={profileData?.data}
          formData={isOwnProfile ? formData : profileData?.data}
          t={t}
          targetAccountId={targetAccountId}
          isOwnProfile={isOwnProfile}
          onEditClick={() => {
            setActiveTab("about")
          }}
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

          {activeTab === "about" && (
            <ProfileAboutTab
              formData={formData}
              editingField={editingField}
              isUpdating={isUpdating}
              handleEdit={handleEdit}
              handleCancel={handleCancel}
              handleSave={handleSave}
              handleChange={handleChange}
              handleCountryChange={handleCountryChange}
              t={t}
              errors={errors}
            />
          )}

          {activeTab === "documents" && (
            <ProfileDocumentsTab
              targetAccountId={targetAccountId}
              isOwnProfile={isOwnProfile}
            />
          )}
        </div>

        <ProfileOtpModal
          open={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          email={profileData?.data?.email}
          title={
            editingField === "phoneNumber"
              ? t.profile?.personalInfo?.verifyPhoneTitle ||
                "Xác nhận thay đổi số điện thoại"
              : editingField === "email"
                ? t.profile?.personalInfo?.verifyEmailTitle ||
                  "Xác nhận thay đổi Email"
                : t.profile?.personalInfo?.verifyChangesTitle ||
                  "Xác minh thay đổi"
          }
          onVerify={handleOtpVerify}
          isVerifying={isUpdating || isUpdatingPhone}
          onResend={handleOtpResend}
          isResending={isSendingOtp || isSendingPhoneOtp}
          t={t}
        />
      </div>
    </div>
  )
}

export default Profile
