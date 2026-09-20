import React, { useMemo } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetInstructorProfileQuery,
  useGetLanguageRequestsQuery,
} from "@/store/api/instructorApi"
import { useGetInstructorBankAccountsQuery } from "@/features/bank-accounts/api/instructorBankAccountsApi"
import PageTitle from "@/shared/components/ui/PageTitle"
import PersonalInfoCard from "@/features/user/components/instructor/approved/PersonalInfoCard"
import VerificationCard from "@/features/user/components/instructor/approved/VerificationCard"
import LanguagesCard from "@/features/user/components/instructor/approved/LanguagesCard"
import VideoCard from "@/features/user/components/instructor/approved/VideoCard"

const ApprovedProfilePage = () => {
  const { t } = useLanguage()
  const ins = t.profile?.instructor || {}

  const {
    data: instructorData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetInstructorProfileQuery()

  const {
    data: languageRequestsData,
    isLoading: isLoadingRequests,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useGetLanguageRequestsQuery()

  const { data: bankAccountsData } = useGetInstructorBankAccountsQuery()

  const profile = useMemo(
    () => instructorData?.data || instructorData || null,
    [instructorData],
  )

  const requests = useMemo(() => {
    const raw = languageRequestsData?.data ?? languageRequestsData
    return Array.isArray(raw) ? raw : []
  }, [languageRequestsData])

  const bankAccount = useMemo(() => {
    const list = Array.isArray(bankAccountsData) ? bankAccountsData : []
    return list.find((account) => account.isDefault) || list[0] || null
  }, [bankAccountsData])

  const handleEditPersonalInfo = () => {}
  const handleChangeEmail = () => {}
  const handleChangePhone = () => {}
  const handleChangeBank = () => {}
  const handleUpdateIdCard = () => {}
  const handleAddLanguage = () => {}
  const handleUpdateLanguage = () => {}
  const handleViewRequest = () => {}
  const handlePlayVideo = () => {}
  const handleReplaceVideo = () => {}
  const handleRemoveVideo = () => {}

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-cath-red-700 border-t-transparent" />
      </div>
    )
  }

  if (isProfileError && !profile) {
    return (
      <div className="flex flex-col gap-4">
        <PageTitle>{t.nav?.instructor || "Hồ sơ giáo viên"}</PageTitle>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-bold text-red-800">
            {ins.loadErrorTitle || "Không tải được hồ sơ giảng viên"}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {ins.loadErrorDesc || "Vui lòng kiểm tra kết nối và thử lại."}
          </p>
          <button
            type="button"
            onClick={() => refetchProfile()}
            className="mt-3 rounded-lg bg-[#990011] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7a000e]"
          >
            {ins.retry || "Thử lại"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PageTitle>{t.nav?.instructor || "Hồ sơ giáo viên"}</PageTitle>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[480fr_757fr]">
        <PersonalInfoCard
          profile={profile}
          t={t}
          onEdit={handleEditPersonalInfo}
        />
        <VerificationCard
          profile={profile}
          bankAccount={bankAccount}
          t={t}
          onChangeEmail={handleChangeEmail}
          onChangePhone={handleChangePhone}
          onChangeBank={handleChangeBank}
          onUpdateIdCard={handleUpdateIdCard}
        />
      </div>

      <LanguagesCard
        languagesTeach={profile?.languagesTeach ?? profile?.LanguagesTeach}
        requests={requests}
        t={t}
        isLoading={isLoadingRequests}
        isError={isRequestsError}
        onRetry={refetchRequests}
        onAddLanguage={handleAddLanguage}
        onUpdateLanguage={handleUpdateLanguage}
        onViewRequest={handleViewRequest}
      />

      <VideoCard
        profile={profile}
        t={t}
        onPlay={handlePlayVideo}
        onReplace={handleReplaceVideo}
        onRemove={handleRemoveVideo}
      />
    </div>
  )
}

export default ApprovedProfilePage
