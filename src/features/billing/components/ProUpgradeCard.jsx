import React from "react"
import { useNavigate } from "react-router-dom"
import PlanCard from "@/features/billing/subscription/components/PlanCard"
import { useGetPlansQuery } from "@/store/api/plansApi"

const DEFAULT_PRO_PLAN = {
  name: "Pro Plan",
  price: 199000,
  interval: "month",
  description:
    "Get full access to create and manage persistent custom rooms for your community.",
  brandColor: "#990011",
  features: [
    "Create persistent, multi-participant custom rooms",
    "Up to 100 participants per room session",
    "Custom cover images, topics, and room passwords",
    "Priority support and premium features",
  ],
}

const ProUpgradeCard = ({ onUpgradeSuccess, className = "" }) => {
  const navigate = useNavigate()
  const { data: plansResponse = [], isLoading: isPlansLoading } = useGetPlansQuery()

  const publishedPlans = plansResponse.filter(
    (plan) => plan.packageStatus === "Published"
  )

  const proPlanRaw =
    publishedPlans.find((p) => p.planName?.toLowerCase().includes("pro")) ||
    publishedPlans[0]

  const plan = proPlanRaw
    ? {
        name: proPlanRaw.planName,
        price: proPlanRaw.priceVnd,
        interval: proPlanRaw.billingCycle,
        description: proPlanRaw.description || DEFAULT_PRO_PLAN.description,
        brandColor: proPlanRaw.brandColor || "#990011",
        features:
          proPlanRaw.subscriptionFeatures && proPlanRaw.subscriptionFeatures.length > 0
            ? proPlanRaw.subscriptionFeatures.map((f) => ({
                id: f.id,
                name: f.featureName,
                limitValue: f.limitValue,
                valueType: f.valueType?.toLowerCase(),
                code: f.featureCode,
              }))
            : DEFAULT_PRO_PLAN.features,
      }
    : DEFAULT_PRO_PLAN

  const handleUpgradeClick = () => {
    onUpgradeSuccess?.()
    if (proPlanRaw) {
      const formattedPlan = {
        id: proPlanRaw.planId,
        name: proPlanRaw.planName,
        price: proPlanRaw.priceVnd,
        interval: proPlanRaw.billingCycle,
        description: proPlanRaw.description,
        features: proPlanRaw.subscriptionFeatures
          ? proPlanRaw.subscriptionFeatures.map((f) => ({
              id: f.id,
              name: f.featureName,
              limitValue: f.limitValue,
              valueType: f.valueType?.toLowerCase(),
              code: f.featureCode,
            }))
          : [],
        applicableRole: proPlanRaw.applicableRole?.toLowerCase(),
        iconUrl: proPlanRaw.iconUrl,
        brandColor: proPlanRaw.brandColor,
      }
      navigate("/checkout", { state: { plan: formattedPlan } })
    } else {
      navigate("/pricing")
    }
  }

  const handleCompareClick = () => {
    onUpgradeSuccess?.()
    navigate("/pricing")
  }

  return (
    <div className={`w-full max-w-[460px] mx-auto ${className}`}>
      <PlanCard
        plan={plan}
        onAction={handleUpgradeClick}
        actionLabel="Upgrade to Pro"
        isProcessing={isPlansLoading}
      />
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={handleCompareClick}
          className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors py-1"
        >
          Compare all plans
        </button>
      </div>
    </div>
  )
}

export default ProUpgradeCard
