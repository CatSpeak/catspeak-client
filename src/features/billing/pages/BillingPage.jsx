import React, { useState } from "react"
import { FileText, AlertCircle } from "lucide-react"
import { useGetPaymentHistoryQuery, useRepayMutation } from "@/store/api/paymentsApi"
import ReportIssueModal from "../invoices/components/ReportIssueModal"
import { useLanguage } from "@/shared/context/LanguageContext"

const BillingPage = () => {
  const { t } = useLanguage()
  const STATUS_MAP = {
    1: { label: t.billing.history.statuses.success, styles: "bg-[#E5F7ED] text-green-700" },
    3: { label: t.billing.history.statuses.pending, styles: "bg-[#FFFBEA] text-yellow-700" },
    0: { label: t.billing.history.statuses.cancelled, styles: "bg-[#F3F3F3] text-[#7A7574]" },
  }

  const { data: invoices = [], isLoading } = useGetPaymentHistoryQuery()
  const [repay, { isLoading: isRepaying }] = useRepayMutation()
  
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)

  const handleRepayClick = async (invoice) => {
    try {
      const response = await repay({
        paymentId: invoice.paymentId,
        amountVnd: Number(invoice.amount),
        returnUrl: `${window.location.origin}/billing/result`,
        cancelUrl: `${window.location.origin}/billing/result`
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
        <h3 className="text-xl font-bold mb-2">{t.billing.history.noHistoryTitle}</h3>
        <p className="text-[#7A7574] max-w-sm">
          {t.billing.history.noHistorySubtitle}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{t.billing.history.title}</h2>
        <p className="text-[#7A7574]">{t.billing.history.subtitle}</p>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F8F8] border-b border-[#E5E5E5]">
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">{t.billing.history.columns.date}</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">{t.billing.history.columns.orderCode}</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">{t.billing.history.columns.method}</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">{t.billing.history.columns.amount}</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">{t.billing.history.columns.status}</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574] text-right">{t.billing.history.columns.actions}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusInfo = STATUS_MAP[invoice.status] || { label: "Unknown", styles: "bg-gray-100 text-gray-700" }
                const isPending = invoice.status === 3

                return (
                  <tr key={invoice.paymentId} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#fafafa]">
                    <td className="py-4 px-6 text-sm">
                      {new Date(invoice.createDate).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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
                      {isPending && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleReport(invoice.paymentId)}
                            className="text-[#7A7574] hover:text-cath-red-700 transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Report Issue"
                          >
                            <AlertCircle size={14} />
                            {t.billing.history.actions.report}
                          </button>
                          <button
                            onClick={() => handleRepayClick(invoice)}
                            disabled={isRepaying}
                            className="bg-cath-red-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:brightness-90 transition-all disabled:opacity-50"
                          >
                            {t.billing.history.actions.repay}
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
    </div>
  )
}

export default BillingPage
