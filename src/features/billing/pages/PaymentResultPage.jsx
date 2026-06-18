import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  useGetPaymentHistoryQuery,
  useRepayMutation,
} from "@/store/api/paymentsApi"

const PaymentResultPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const isCancelled = searchParams.get("cancel") === "true"
  const orderCodeStr = searchParams.get("orderCode")
  const orderCode = orderCodeStr ? parseInt(orderCodeStr, 10) : null

  const { data: invoices = [], isLoading: isHistoryLoading } =
    useGetPaymentHistoryQuery()
  const [repay, { isLoading: isRepaying }] = useRepayMutation()

  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const [repayAmount, setRepayAmount] = useState(0)

  const handleReturn = () => {
    navigate("/workspace/billing")
  }

  const handleRepayClick = () => {
    const payment = invoices.find((inv) => inv.orderCode === orderCode)
    if (payment) {
      setRepayAmount(payment.amount)
      setRepayModalOpen(true)
    } else {
      console.error("Could not find payment to repay in history.")
    }
  }

  const handleRepayConfirm = async (e) => {
    e.preventDefault()
    const payment = invoices.find((inv) => inv.orderCode === orderCode)
    if (!payment) return

    try {
      const response = await repay({
        paymentId: payment.paymentId,
        amountVnd: Number(repayAmount),
        returnUrl: `${window.location.origin}/workspace/billing/result`,
        cancelUrl: `${window.location.origin}/workspace/billing/result`,
      }).unwrap()

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      console.error("Failed to initiate repayment", error)
    }
  }

  if (isHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-cath-red-700 animate-spin mb-4" />
        <p className="text-[#7A7574]">Verifying payment status...</p>
      </div>
    )
  }

  const paymentRecord = invoices.find((inv) => inv.orderCode === orderCode)

  if (!isCancelled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-[#E5F7ED] text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-[#7A7574] mb-8 text-center max-w-md">
          Thank you for your purchase. Your plan has been successfully upgraded.
          {orderCode && (
            <span className="block mt-2 font-mono text-xs">
              Order Code: #{orderCode}
            </span>
          )}
        </p>
        <PillButton onClick={handleReturn} className="w-64">
          Return to Billing
        </PillButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-[#FFF5F5] text-cath-red-700 rounded-full flex items-center justify-center mb-6">
        <XCircle size={40} />
      </div>
      <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
      <p className="text-[#7A7574] mb-8 text-center max-w-md">
        Your payment was not completed. You have not been charged.
        {orderCode && (
          <span className="block mt-2 font-mono text-xs">
            Order Code: #{orderCode}
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <PillButton variant="secondary" onClick={handleReturn} className="w-48">
          Return to Billing
        </PillButton>
        {paymentRecord && (
          <PillButton
            onClick={handleRepayClick}
            loading={isRepaying}
            className="w-48"
          >
            Repay Now
          </PillButton>
        )}
      </div>

      <Modal
        open={repayModalOpen}
        onClose={() => setRepayModalOpen(false)}
        title="Repay Custom Amount"
        className="max-w-sm"
      >
        <form onSubmit={handleRepayConfirm} className="pb-4">
          <p className="mb-4 text-sm text-[#7A7574]">
            Please confirm or adjust the amount you would like to pay (in VND).
          </p>
          <div className="mb-6">
            <label
              className="block text-sm font-semibold mb-2"
              htmlFor="repayAmount"
            >
              Amount (VND)
            </label>
            <input
              type="number"
              id="repayAmount"
              min="10000"
              step="1000"
              required
              className="w-full border border-[#E5E5E5] rounded-xl p-3 outline-none focus:border-[#333] transition-colors"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              disabled={isRepaying}
            />
          </div>
          <div className="flex gap-4">
            <PillButton
              variant="secondary"
              className="flex-1"
              type="button"
              onClick={() => setRepayModalOpen(false)}
              disabled={isRepaying}
            >
              Cancel
            </PillButton>
            <PillButton className="flex-1" type="submit" loading={isRepaying}>
              Proceed to Pay
            </PillButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PaymentResultPage
