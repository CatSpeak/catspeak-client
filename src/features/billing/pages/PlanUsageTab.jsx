import React from "react"
import { useGetMyUsageQuery } from "@/store/api/plansApi"
import PlanUsageHeader from "../components/PlanUsageHeader"
import UsageQuotaCard from "../components/UsageQuotaCard"
import PlanFeaturesTable from "../components/PlanFeaturesTable"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PlanUsageTab = () => {
  const { t } = useLanguage()
  const pageT = t?.planUsage || {}
  const quotasT = pageT.quotas || {}

  const { data: usageData, isLoading, isError, refetch } = useGetMyUsageQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cath-red-700 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">{pageT.loading || "Đang tải thông tin sử dụng gói dịch vụ..."}</p>
      </div>
    )
  }

  if (isError || !usageData) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center max-w-md mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{pageT.errorTitle || "Không Thể Tải Dữ Liệu Usage"}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {pageT.errorDesc || "Đã có lỗi xảy ra khi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền và thử lại."}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{pageT.btnRetry || "Thử Lại"}</span>
        </button>
      </div>
    )
  }

  // Filter quantifiable quota features for the cards grid
  const quotaFeatures = (usageData.features || []).filter(
    (f) => f.unit !== "boolean" && f.limitValue !== "true" && f.limitValue !== "false"
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <PlanUsageHeader usageData={usageData} />

      {/* 2. Key Quotas Cards Grid */}
      {quotaFeatures.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4">{quotasT.title || "Hạn Ngạch Tính Năng Chính"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quotaFeatures.map((feature) => (
              <UsageQuotaCard key={feature.featureCode} feature={feature} />
            ))}
          </div>
        </div>
      )}

      {/* 3. Detailed Features Table */}
      <PlanFeaturesTable features={usageData.features} />
    </div>
  )
}

export default PlanUsageTab
