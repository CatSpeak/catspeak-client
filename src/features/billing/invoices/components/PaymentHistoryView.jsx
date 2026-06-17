import React from "react"
import { useBilling } from "../../context/BillingContext"
import { FileText } from "lucide-react"

const PaymentHistoryView = () => {
  const { invoices } = useBilling()

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
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Invoice ID</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Plan</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Amount</th>
                <th className="py-4 px-6 font-semibold text-sm text-[#7A7574]">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#fafafa]">
                  <td className="py-4 px-6 text-sm">
                    {new Date(invoice.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-[#7A7574]">
                    {invoice.id}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {invoice.planName}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium">
                    {invoice.amount < 0 ? `-$${Math.abs(invoice.amount).toFixed(2)}` : `$${invoice.amount.toFixed(2)}`}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-[#E5F7ED] text-green-700"
                          : "bg-[#FFF5F5] text-cath-red-700"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistoryView
