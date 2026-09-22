import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
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
  const { isTeacher } = useRoleOverride()
  // Teacher accounts manage professional/verification details on /setting/instructor.
  // This page provides account-level settings (username, nickname, password).
  const isTeacherAccount = isTeacher === true

  // Fetch private profile
  const { data: privateProfileData, isLoading } = useGetUserProfileQuery()
  const profile = privateProfileData?.data ?? privateProfileData ?? null

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
    isSendingOtp,
    isSavingSecurity,
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
        />
      </div>

      {/* Password — own card */}
      <FluentCard className="flex flex-col w-full p-6 sm:p-8 gap-4 border-border rounded-xl shadow-sm !justify-start">
        <ChangePasswordSection t={t} />
      </FluentCard>

      {/* Bank Accounts Section — teacher accounts manage this on
          /setting/instructor (see BankAccountDrawer). */}
      {!isTeacherAccount && <BankAccountList />}

      <ProfileOtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={profile?.email}
        title={t.profile?.personalInfo?.verifyChangesTitle || "Xác minh thay đổi"}
        onVerify={handleOtpVerify}
        isVerifying={isSavingSecurity}
        onResend={handleOtpResend}
        isResending={isSendingOtp}
        t={t}
      />
    </div>
  )
}

export default AccountInfoPage
