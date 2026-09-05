import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useGetInstructorProfileQuery } from "@/store/api/instructorApi"
import { useProfileState } from "@/features/settings/hooks/useProfileState"
import { useProfileMutations } from "@/features/settings/hooks/useProfileMutations"

import ProfileOtpModal from "@/features/settings/components/ProfileOtpModal"
import AccountSettingsForm from "@/features/settings/components/AccountSettingsForm"
import ChangePasswordSection from "@/features/settings/components/ChangePasswordSection"
import PageTitle from "@/shared/components/ui/PageTitle"
import FluentCard from "@/shared/components/ui/FluentCard"
import { BankAccountList } from "@/features/bank-accounts"

const AccountInfoPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()

  // Fetch private profile
  const { data: privateProfileData, isLoading } = useGetUserProfileQuery()
  const profile = privateProfileData?.data ?? privateProfileData ?? null

  // Teacher-only extras (FullName + ID card) show on the teacher account only
  const isTeacherAccount =
    user?.accountType === "Teacher" || (!user?.accountType && !!profile?.isTeacher)

  const { data: instructorData } = useGetInstructorProfileQuery(undefined, {
    skip: !isTeacherAccount,
  })
  const instructor = instructorData?.data ?? instructorData ?? null
  // Show the ID section only on the teacher account with a live Approved
  // profile (source accounts get a revision row → hidden by design).
  const instructorStatus = (instructor?.status || instructor?.Status || "").toString().toLowerCase()
  const isLiveApprovedProfile =
    !!instructor && !instructor.isRevision && !instructor.IsRevision && instructorStatus === "approved"
  const showIdentitySection = isTeacherAccount && isLiveApprovedProfile
  const idCardFrontUrl = instructor?.idCardFrontUrl || instructor?.IdCardFrontUrl || null
  const idCardBackUrl = instructor?.idCardBackUrl || instructor?.IdCardBackUrl || null

  const stateHooks = useProfileState(profile)
  const mutationHooks = useProfileMutations(t, profile, stateHooks)

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
  } = mutationHooks

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-cath-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle>{t.nav?.accountInfo || "Thông tin tài khoản"}</PageTitle>

      <div id="account-info-sections" className="w-full">
        <AccountSettingsForm
          formData={formData}
          editingField={editingField}
          isUpdating={isUpdating}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onChange={handleChange}
          onCountryChange={handleCountryChange}
          errors={errors}
          t={t}
          isTeacherAccount={isTeacherAccount}
          showIdentitySection={showIdentitySection}
          idCardFrontUrl={idCardFrontUrl}
          idCardBackUrl={idCardBackUrl}
          userEmail={profile?.email || ""}
        />
      </div>

      {/* Password — own card */}
      <FluentCard className="flex flex-col w-full p-6 sm:p-8 gap-4 border-border rounded-xl shadow-sm !justify-start">
        <ChangePasswordSection t={t} />
      </FluentCard>

      {/* Bank Accounts Section */}
      <BankAccountList />

      <ProfileOtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={profile?.email}
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
  )
}

export default AccountInfoPage
