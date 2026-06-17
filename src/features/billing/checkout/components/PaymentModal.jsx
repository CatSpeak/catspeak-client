import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useBilling } from "../../context/BillingContext"
import { CheckCircle2, CreditCard } from "lucide-react"

const PaymentModal = ({ isOpen, onClose }) => {
  const { plans, upgradeToPro } = useBilling()
  const [step, setStep] = useState("form") // form | loading | success
  const proPlan = plans.pro

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStep("loading")
    await upgradeToPro()
    setStep("success")
  }

  const handleClose = () => {
    if (step === "loading") return
    onClose()
    // Reset state after animation finishes
    setTimeout(() => setStep("form"), 300)
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={step === "form" ? "Upgrade to Pro" : ""}
      showCloseButton={step !== "loading"}
      className="max-w-md"
    >
      {step === "form" && (
        <form onSubmit={handleSubmit} className="pb-4">
          <div className="bg-[#f8f8f8] p-4 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{proPlan.name}</span>
              <span className="font-bold">${proPlan.price}/{proPlan.interval}</span>
            </div>
            <p className="text-sm text-[#7A7574]">Billed immediately.</p>
          </div>

          <div className="space-y-4 mb-6">
            <TextInput
              id="name"
              label="Name on card"
              placeholder="John Doe"
              required
            />
            <TextInput
              id="cardNumber"
              label="Card Information"
              placeholder="0000 0000 0000 0000"
              icon={CreditCard}
              required
            />
            <div className="flex gap-4">
              <TextInput
                id="expiry"
                placeholder="MM/YY"
                containerClassName="flex-1"
                required
              />
              <TextInput
                id="cvc"
                placeholder="CVC"
                containerClassName="flex-1"
                required
              />
            </div>
          </div>

          <PillButton type="submit" className="w-full">
            Confirm Payment
          </PillButton>
          <p className="text-center text-xs text-[#7A7574] mt-4">
            This is a mock UI. No real payment will be processed.
          </p>
        </form>
      )}

      {step === "loading" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-cath-red-700 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-semibold">Processing Payment...</h3>
          <p className="text-sm text-[#7A7574]">Please don't close this window.</p>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-[#E5F7ED] text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
          <p className="text-[#7A7574] mb-8">
            You are now on the Pro plan. Enjoy your new features.
          </p>
          <PillButton onClick={handleClose} className="w-full">
            Back to Dashboard
          </PillButton>
        </div>
      )}
    </Modal>
  )
}

export default PaymentModal
