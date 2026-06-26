import React, { useState } from "react"
import PlanCard from "../subscription/components/PlanCard"
import CheckoutModal from "../subscription/components/CheckoutModal"
import { useCheckoutMutation } from "@/store/api/paymentsApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useGetPlansQuery } from "@/store/api/plansApi"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"

const PricingPage = () => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation()
  const { data: plansResponse = [], isLoading: isPlansLoading } =
    useGetPlansQuery()

  const userTier = profileResponse?.data?.tier?.toLowerCase()
  const currentPlanId = userTier === "pro" ? "pro" : "free"

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan)
    setIsCheckoutModalOpen(true)
  }

  const handleUpgradeConfirm = async (plan) => {
    try {
      const response = await checkout({
        amountVnd: plan.price,
        returnUrl: `${window.location.origin}/billing/result`,
        cancelUrl: `${window.location.origin}/billing/result`,
      }).unwrap()

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      console.error("Failed to checkout", error)
    }
  }

  const isProcessing = isCheckoutLoading || isProfileLoading || isPlansLoading

  const formattedPlans = plansResponse.map((plan) => ({
    id: plan.planId,
    name: plan.planName,
    price: plan.priceVnd,
    interval: plan.billingCycle,
    description: plan.description,
    features: plan.subscriptionFeatures
      ? plan.subscriptionFeatures.map((f) => f.featureName)
      : [],
    applicableRole: plan.applicableRole?.toLowerCase(),
  }))

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t.billing.pricing.title}</h2>
        <p className="text-[#7A7574]">{t.billing.pricing.subtitle}</p>
      </div>

      {isPlansLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-cath-red-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {formattedPlans.map((plan) => {
            const isActive = currentPlanId === plan.applicableRole
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={isActive}
                actionLabel={`Upgrade to ${plan.name}`}
                isProcessing={isProcessing}
                onAction={
                  plan.price > 0 ? () => handleUpgradeClick(plan) : undefined
                }
              />
            )
          })}
        </div>
      )}

      {selectedPlan && (
        <CheckoutModal
          open={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          plan={selectedPlan}
          onConfirm={handleUpgradeConfirm}
          isProcessing={isCheckoutLoading}
        />
      )}
    </div>
  )
}

export default PricingPage
