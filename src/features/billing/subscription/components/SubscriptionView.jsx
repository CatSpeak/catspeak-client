import React, { useState } from "react"
import { useBilling } from "../../context/BillingContext"
import PlanCard from "./PlanCard"
import PaymentModal from "../../checkout/components/PaymentModal"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const SubscriptionView = () => {
  const { currentPlanId, plans, isProcessing, downgradeToFree } = useBilling()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)

  const handleDowngradeConfirm = async () => {
    await downgradeToFree()
    setIsDowngradeModalOpen(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-[#7A7574]">
          Choose the right plan for your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <PlanCard
          plan={plans.free}
          isActive={currentPlanId === "free"}
          actionLabel="Downgrade"
          isProcessing={isProcessing}
          onAction={() => setIsDowngradeModalOpen(true)}
        />
        <PlanCard
          plan={plans.pro}
          isActive={currentPlanId === "pro"}
          actionLabel="Upgrade to Pro"
          isProcessing={isProcessing}
          onAction={() => setIsPaymentModalOpen(true)}
        />
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <Modal
        open={isDowngradeModalOpen}
        onClose={() => setIsDowngradeModalOpen(false)}
        title="Downgrade to Free"
        className="max-w-sm"
      >
        <div className="pb-4">
          <p className="mb-6 text-[#333]">
            Are you sure you want to downgrade to the Free plan? You will lose access to Pro features immediately. A prorated refund will be issued.
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
    </div>
  )
}

export default SubscriptionView
