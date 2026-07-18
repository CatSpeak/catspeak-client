import React from "react"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useProfileState } from "@/features/settings/hooks/useProfileState"
import { useProfileMutations } from "@/features/settings/hooks/useProfileMutations"

import AccountHeader from "@/features/settings/components/AccountHeader"
import ProfileOtpModal from "@/features/settings/components/ProfileOtpModal"
import AccountSettingsForm from "@/features/settings/components/AccountSettingsForm"
import PageTitle from "@/shared/components/ui/PageTitle"

const AccountInfoPage = () => {
  const { user } = useAuth()
  const { t } = useLanguage()

  // Fetch private profile
  const { data: privateProfileData, isLoading } = useGetUserProfileQuery()

  const stateHooks = useProfileState(privateProfileData?.data)
  const mutationHooks = useProfileMutations(t, privateProfileData?.data, stateHooks)

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
       <PageTitle>
              {t.nav?.accountInfo || "Thông tin tài khoản"}
            </PageTitle>
      <AccountHeader
        user={privateProfileData?.data}
        formData={formData}
        t={t}
      />

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
        />
      </div>

      <ProfileOtpModal
        open={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={privateProfileData?.data?.email}
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
