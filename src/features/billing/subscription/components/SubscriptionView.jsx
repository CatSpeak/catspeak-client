import React, { useState } from "react"
import { PLANS } from "../../mock/data"
import PlanCard from "./PlanCard"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  useCheckoutMutation,
  useGetPaymentHistoryQuery,
} from "@/store/api/paymentsApi"

const SubscriptionView = () => {
  const { data: invoices = [], isLoading: isHistoryLoading } =
    useGetPaymentHistoryQuery()
  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation()

  // Determine current plan from history: if there is a successful Pro payment, assume Pro.
  // In a real app, this would likely come from the user profile.
  const hasProPayment = invoices.some((inv) => inv.status === 1)
  const currentPlanId = hasProPayment ? "pro" : "free"

  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState(250000)

  const handleDowngradeConfirm = async () => {
    // Downgrade API not provided, so just close modal
    setIsDowngradeModalOpen(false)
  }

  const handleUpgradeClick = () => {
    setIsAmountModalOpen(true)
  }

  const handleUpgradeConfirm = async (e) => {
    e.preventDefault()
    try {
      const response = await checkout({
        amountVnd: Number(customAmount),
        returnUrl: `${window.location.origin}/workspace/billing/result`,
        cancelUrl: `${window.location.origin}/workspace/billing/result`,
      }).unwrap()

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      console.error("Failed to checkout", error)
    }
  }

  const isProcessing = isCheckoutLoading || isHistoryLoading

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-[#7A7574]">
          Choose the right plan for your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <PlanCard
          plan={PLANS.free}
          isActive={currentPlanId === "free"}
          actionLabel="Downgrade"
          isProcessing={isProcessing}
          onAction={() => setIsDowngradeModalOpen(true)}
        />
        <PlanCard
          plan={PLANS.pro}
          isActive={currentPlanId === "pro"}
          actionLabel="Upgrade to Pro"
          isProcessing={isProcessing}
          onAction={handleUpgradeClick}
        />
      </div>

      <Modal
        open={isDowngradeModalOpen}
        onClose={() => setIsDowngradeModalOpen(false)}
        title="Downgrade to Free"
        className="max-w-sm"
      >
        <div className="pb-4">
          <p className="mb-6 text-[#333]">
            Are you sure you want to downgrade to the Free plan? You will lose
            access to Pro features immediately. A prorated refund will be
            issued.
          </p>
          <div className="flex gap-4">
            <PillButton
              variant="secondary"
              className="flex-1"
              onClick={() => setIsDowngradeModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </PillButton>
            <PillButton
              className="flex-1"
              onClick={handleDowngradeConfirm}
              loading={isProcessing}
              loadingText="Downgrading..."
            >
              Downgrade
            </PillButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        title="Custom Payment Amount"
        className="max-w-sm"
      >
        <form onSubmit={handleUpgradeConfirm} className="pb-4">
          <p className="mb-4 text-sm text-[#7A7574]">
            Please enter the amount you would like to pay for the Pro plan (in
            VND).
          </p>
          <div className="mb-6">
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="amount"
            >
              Amount (VND)
            </label>
            <input
              type="number"
              id="amount"
              required
              className="w-full border border-[#E5E5E5] rounded-xl p-3 outline-none focus:border-[#333] transition-colors"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              disabled={isCheckoutLoading}
            />
          </div>
          <div className="flex gap-4">
            <PillButton
              variant="secondary"
              className="flex-1"
              type="button"
              onClick={() => setIsAmountModalOpen(false)}
              disabled={isCheckoutLoading}
            >
              Cancel
            </PillButton>
            <PillButton
              className="flex-1"
              type="submit"
              loading={isCheckoutLoading}
            >
              Proceed to Pay
            </PillButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SubscriptionView
