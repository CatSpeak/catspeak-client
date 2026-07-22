import React from "react"

const BillingTableRow = ({
  invoice,
  statusInfo,
  formatDate,
  formatAmount,
}) => {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors">
      <td className="py-4 px-6 text-sm text-gray-600">
        {formatDate(invoice.createDate)}
      </td>
      <td className="py-4 px-6 text-sm font-medium text-gray-800">
        #{invoice.orderCode}
      </td>
      <td className="py-4 px-6 text-sm text-gray-600">
        {invoice.method}
      </td>
      <td className="py-4 px-6 text-sm font-medium text-gray-800">
        {formatAmount(invoice.amount)}
      </td>
      <td className="py-4 px-6 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.styles}`}
        >
          {statusInfo.label}
        </span>
      </td>
    </tr>
  )
}

export default BillingTableRow
