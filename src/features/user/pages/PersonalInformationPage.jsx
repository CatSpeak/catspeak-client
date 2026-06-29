import React from "react"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useProfileState } from "../hooks/useProfileState"
import { useProfileMutations } from "../hooks/useProfileMutations"

import ProfileHeader from "../components/ProfileHeader"
import BasicInfoSection from "../components/BasicInfoSection"
import AccountPrivacySection from "../components/AccountPrivacySection"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import ProfileOtpModal from "../components/ProfileOtpModal"
import { countries } from "@/shared/constants/countriesData"

const PersonalInformationPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { data: profileData, isLoading, error } = useGetUserProfileQuery()

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

  return (
    <>
      <PageTitle>{t.profile?.personalInfo?.title}</PageTitle>
      <div className="w-full flex flex-col gap-6 relative z-10">
        <ProfileHeader
          avatarImageUrl={displayAvatarUrl}
          onUpdateAvatarFile={handleUpdateAvatarFile}
          username={formData.username}
          t={t}
        />

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-red-900">
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

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-red-900">
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
    </>
  )
}

export default PersonalInformationPage
