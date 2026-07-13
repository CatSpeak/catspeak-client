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
} from "../api/friendshipApi"

import SocialProfileHeader from "../components/SocialProfileHeader"
import ProfileHomeTab from "../components/ProfileHomeTab"
import ProfileMediaTab from "../components/ProfileMediaTab"
import ProfileFriendsTab from "../components/ProfileFriendsTab"
import ProfileDocumentsTab from "../components/ProfileDocumentsTab"
import BasicInfoSection from "../../user/components/BasicInfoSection"
import AccountPrivacySection from "../../user/components/AccountPrivacySection"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
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

  const profileData = isOwnProfile
    ? privateProfileData
    : publicProfileResponse?.data
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
    <div className="w-full min-h-[calc(100vh-70px)] bg-[#F5F6F8]">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col pt-6 relative z-10 px-4 md:px-0">
        {/* Top Header Section */}
        <SocialProfileHeader
          user={isOwnProfile ? user : profileData}
          formData={isOwnProfile ? formData : profileData}
          t={t}
          targetAccountId={targetAccountId}
          isOwnProfile={isOwnProfile}
        />

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6 flex gap-8 overflow-x-auto hide-scrollbar px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[15px] font-semibold whitespace-nowrap border-b-[3px] transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-[#990011] text-[#990011]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-[#990011] text-white"
                      : "bg-[#F0F0F0] text-gray-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full mt-6">
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
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-20">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {t.profile?.personalInfo?.title || "Personal Information"}
                </h2>
                <FluentCard variant="glass" className="flex flex-col gap-6">
                  <BasicInfoSection
                    formData={formData}
                    editingField={editingField}
                    isUpdating={isUpdating}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                    onCountryChange={handleCountryChange}
                    t={t}
                  />
                </FluentCard>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t.profile?.personalInfo?.accountAndPrivacy ||
                    "Account and Privacy"}
                </h2>
                <FluentCard variant="glass" className="flex flex-col gap-6">
                  <AccountPrivacySection
                    formData={formData}
                    editingField={editingField}
                    isUpdating={isUpdating}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                    t={t}
                    errors={errors}
                  />
                </FluentCard>
              </div>
            </div>
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
