import React, { useState } from "react"
import { FileText, AlertCircle } from "lucide-react"
import { useGetPaymentHistoryQuery, useRepayMutation } from "@/store/api/paymentsApi"
import ReportIssueModal from "./ReportIssueModal"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const STATUS_MAP = {
  1: { label: "Success", styles: "bg-[#E5F7ED] text-green-700" },
  2: { label: "Failed", styles: "bg-[#FFF5F5] text-cath-red-700" },
  3: { label: "Pending", styles: "bg-[#FFFBEA] text-yellow-700" },
  0: { label: "Unpaid", styles: "bg-[#F3F3F3] text-[#7A7574]" },
}

const PaymentHistoryView = () => {
  const { data: invoices = [], isLoading } = useGetPaymentHistoryQuery()
  const [repay, { isLoading: isRepaying }] = useRepayMutation()
  
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  
  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const [repayAmount, setRepayAmount] = useState(0)

  const handleRepayClick = (invoice) => {
    setSelectedPaymentId(invoice.paymentId)
    setRepayAmount(invoice.amount)
    setRepayModalOpen(true)
  }

  const handleRepayConfirm = async (e) => {
    e.preventDefault()
    try {
      const response = await repay({
        paymentId: selectedPaymentId,
        amountVnd: Number(repayAmount),
        returnUrl: `${window.location.origin}/workspace/billing/result`,
        cancelUrl: `${window.location.origin}/workspace/billing/result`
      }).unwrap()

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      console.error("Failed to initiate repayment", error)
    }
  }

  const handleReport = (paymentId) => {
    setSelectedPaymentId(paymentId)
    setReportModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-cath-red-700 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-[#F3F3F3] rounded-full flex items-center justify-center mb-4">
          <FileText size={32} className="text-[#BFBFBF]" />
        </div>
        <h3 className="text-xl font-bold mb-2">No payment history</h3>
        <p className="text-[#7A7574] max-w-sm">
          You don't have any past invoices yet. Once you upgrade or make a payment, it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Payment History</h2>
        <p className="text-[#7A7574]">View your past invoices and billing history.</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8F8] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Date</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Order Code</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Method</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Amount</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusInfo = STATUS_MAP[invoice.status] || { label: "Unknown", styles: "bg-gray-100 text-gray-700" }
                const isUnsuccessful = invoice.status === 2 || invoice.status === 3 || invoice.status === 0

                return (
                  <tr key={invoice.paymentId} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#fafafa]">
                    <td className="py-4 px-6 text-sm">
                      {new Date(invoice.createDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-[#7A7574]">
                      #{invoice.orderCode}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {invoice.method}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.amount)}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.styles}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      {isUnsuccessful && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleReport(invoice.paymentId)}
                            className="text-[#7A7574] hover:text-cath-red-700 transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Report Issue"
                          >
                            <AlertCircle size={14} />
                            Report
                          </button>
                          <button
                            onClick={() => handleRepayClick(invoice)}
                            disabled={isRepaying}
                            className="bg-cath-red-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:brightness-90 transition-all disabled:opacity-50"
                          >
                            Repay
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPaymentId && (
        <ReportIssueModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          paymentId={selectedPaymentId}
        />
      )}

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
            <label className="block text-sm font-semibold mb-2" htmlFor="repayAmount">
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
            <PillButton
              className="flex-1"
              type="submit"
              loading={isRepaying}
            >
              Proceed to Pay
            </PillButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PaymentHistoryView
