import React from "react"
import { FileText } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

/**
 * Reusable DataTable component with desktop table + mobile card layout.
 *
 * @param {Array} columns - Array of column definitions: { key, label, render?, className?, headerClassName? }
 *   - key: unique string identifier for the column
 *   - label: display text for the column header
 *   - render: (row, index) => ReactNode — custom cell renderer (optional, defaults to row[key])
 *   - className: extra classes for td cells
 *   - headerClassName: extra classes for th cells
 * @param {Array} data - Array of row objects
 * @param {function} rowKey - (row, index) => string — returns a unique key for each row
 * @param {string} emptyTitle - Title text when no data
 * @param {string} emptyDescription - Description text when no data
 * @param {ReactNode} emptyIcon - Icon element for empty state (defaults to FileText)
 * @param {function} renderMobileCard - (row, index) => ReactNode — optional custom mobile card renderer
 * @param {string} className - Extra classes for the outer wrapper
 */
const DataTable = ({
  columns = [],
  data = [],
  rowKey,
  emptyTitle = "No results found",
  emptyDescription = "Try changing the filters or search keyword.",
  emptyIcon,
  renderMobileCard,
  className = "",
}) => {
  // Empty state
  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 flex-1 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {emptyIcon || <FileText className="w-8 h-8 text-gray-400" />}
        </div>
        <p className="text-gray-800 font-medium mb-1">{emptyTitle}</p>
        <p className="text-gray-400 text-sm">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table — hidden on mobile */}
      <FluentCard padding="!p-0" className={`overflow-hidden flex-1 hidden md:block !border-gray-200 !rounded-2xl ${className}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-50/50 text-cath-red-800 border-b border-red-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 font-semibold text-[13px] ${col.headerClassName || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((row, index) => (
              <tr
                key={rowKey ? rowKey(row, index) : index}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-4 px-6 text-sm ${col.className || "text-gray-600"}`}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </FluentCard>

      {/* Mobile card layout — visible only on mobile */}
      {renderMobileCard && (
        <div className={`flex flex-col gap-3 flex-1 md:hidden ${className}`}>
          {data.map((row, index) => (
            <React.Fragment key={rowKey ? rowKey(row, index) : index}>
              {renderMobileCard(row, index)}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  )
}

export default DataTable
