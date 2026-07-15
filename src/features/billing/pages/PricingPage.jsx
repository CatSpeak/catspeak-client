import React from "react"
import { useNavigate } from "react-router-dom"
import PlanCard from "../subscription/components/PlanCard"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useGetPlansQuery } from "@/store/api/plansApi"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Breadcrumb } from "@/shared/components/ui/navigation"
import { getGridClasses } from "../utils/planUtils"
import { History } from "lucide-react"

const PricingPage = () => {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
  const { data: plansResponse = [], isLoading: isPlansLoading } =
    useGetPlansQuery()

  const userTier = profileResponse?.data?.tier?.toLowerCase()

  const handleUpgradeClick = (plan) => {
    navigate("/checkout", { state: { plan } })
  }

  const isProcessing = isProfileLoading || isPlansLoading

  const formattedPlans = plansResponse
    .filter((plan) => plan.packageStatus === "Published")
    .map((plan) => ({
      id: plan.planId,
      name: plan.planName,
      price: plan.priceVnd,
      interval: plan.billingCycle,
      description: plan.description,
      features: plan.subscriptionFeatures
        ? plan.subscriptionFeatures
          .map((f) => ({
            id: f.id,
            name: f.featureName,
            limitValue: f.limitValue,
            valueType: f.valueType?.toLowerCase(),
            code: f.featureCode,
          }))
        : [],
      applicableRole: plan.applicableRole?.toLowerCase(),
      iconUrl: plan.iconUrl,
      brandColor: plan.brandColor,
    }))

  const breadcrumbItems = [
    {
      label: t.nav?.home || "Home",
      onClick: () => navigate(`/${language}/community`),
    },
    {
      label: t.billing.pricing.title,
    },
  ]

  return (
    <div className="mx-auto px-12 pt-6 pb-16 w-full font-nunito animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl">
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Title & History Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 w-full">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t.billing.pricing.title}
          </h1>
        </div>

        {/* Billing History Button */}
        <button
          onClick={() => navigate("/billing")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-cath-red-700 text-cath-red-700 font-semibold text-sm hover:bg-[#990011]/5 transition-all w-fit cursor-pointer active:scale-95 shadow-sm hover:shadow"
        >
          <span>{t.billing.billingHistory || "Lịch sử thanh toán"}</span>
          <History size={16} />
        </button>
      </div>

      {isPlansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 bg-white p-6 rounded-3xl shadow-sm animate-pulse space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-1/2" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="h-12 bg-gray-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className={getGridClasses(formattedPlans.length)}>
            {formattedPlans.map((plan) => {
              const isActive = userTier === plan.name?.toLowerCase()
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isActive={isActive}
                  actionLabel={t.billing.pricing.upgradeTo.replace("{{planName}}", plan.name)}
                  isProcessing={isProcessing}
                  onAction={
                    plan.price > 0 ? () => handleUpgradeClick(plan) : undefined
                  }
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingPage
