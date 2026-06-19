import React, { useState } from "react"
import { PLANS } from "../mock/data"
import PlanCard from "../subscription/components/PlanCard"
import CheckoutModal from "../subscription/components/CheckoutModal"
import { useCheckoutMutation } from "@/store/api/paymentsApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"

const PricingPage = () => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, { skip: !isAuthenticated })
  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation()

  const userTier = profileResponse?.data?.tier?.toLowerCase()
  const currentPlanId = userTier === "pro" ? "pro" : "free"

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)

  const handleUpgradeClick = () => {
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

  const isProcessing = isCheckoutLoading || isProfileLoading

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t.billing.pricing.title}</h2>
        <p className="text-[#7A7574]">
          {t.billing.pricing.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <PlanCard
          plan={PLANS.free}
          isActive={currentPlanId === "free"}
          isProcessing={isProcessing}
        />
        <PlanCard
          plan={PLANS.pro}
          isActive={currentPlanId === "pro"}
          actionLabel="Upgrade to Pro"
          isProcessing={isProcessing}
          onAction={handleUpgradeClick}
        />
      </div>

      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        plan={PLANS.pro}
        onConfirm={handleUpgradeConfirm}
        isProcessing={isCheckoutLoading}
      />
    </div>
  )
}

export default PricingPage
