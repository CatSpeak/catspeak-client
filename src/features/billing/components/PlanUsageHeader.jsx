import React from "react"
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import { Crown, Sparkles, Calendar, ArrowRight, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PlanUsageHeader = ({ usageData }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const headerT = t?.planUsage?.header || {}

  if (!usageData) return null

  const { planName, subscriptionEndDate, isPro } = usageData

  const formattedDate = subscriptionEndDate
    ? dayjs(subscriptionEndDate).format("DD/MM/YYYY HH:mm")
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cath-red-900 via-cath-red-700 to-amber-600 text-white p-6 sm:p-8 shadow-xl mb-8">
      {/* Background Decorative Pattern */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-20 top-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left Column: Plan Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
              {isPro ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  {headerT.proMember || "Pro Member"}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                  {headerT.freeMember || "Free Member"}
                </>
              )}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2 text-white">
            {headerT.planTitle || "Gói Dịch Vụ:"} <span className="text-amber-300">{planName}</span>
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
            {isPro
              ? (headerT.proDescription || "Bạn đang sở hữu toàn bộ đặc quyền Pro cao cấp nhất của CatSpeak.")
              : (headerT.freeDescription || "Nâng cấp lên gói Pro để mở rộng dung lượng lưu trữ, phòng custom và hạn ngạch AI.")}
          </p>

          {formattedDate && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-100 font-medium bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{headerT.expiresOn || "Hạn sử dụng gói:"} <strong className="text-white">{formattedDate}</strong></span>
            </div>
          )}
        </div>

        {/* Right Column: CTA Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-cath-red-950 shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 fill-cath-red-950" />
            <span>{isPro ? (headerT.btnRenew || "Gia Hạn / Nâng Gói") : (headerT.btnUpgrade || "Nâng Cấp Pro Ngay")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanUsageHeader
