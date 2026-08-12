import React from "react"
import { SearchInput } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"

const BillingFilters = ({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  t,
}) => {
  const hist = t.billing?.history || {}

  const dateOptions = [
    { value: "all", label: hist.dateFilterAll || "All time" },
    { value: "week", label: hist.dateFilterWeek || "Last 7 days" },
    { value: "month", label: hist.dateFilterMonth || "Last 30 days" },
  ]

  const statusOptions = [
    { value: "all", label: hist.statusFilterAll || "All statuses" },
    { value: "1", label: hist.statusFilterSuccess || "Success" },
    { value: "2", label: hist.statusFilterFailed || "Failed" },
    { value: "3", label: hist.statusFilterPending || "Pending" },
    { value: "4", label: hist.statusFilterRefunded || "Refunded" },
    { value: "0", label: hist.statusFilterCancelled || "Cancelled" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="w-full sm:flex-1 sm:max-w-sm">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={hist.searchPlaceholder || "Enter invoice ID..."}
        />
      </div>

      <div className="w-full sm:w-auto">
        <Dropdown
          options={dateOptions}
          value={dateFilter}
          onChange={(val) => onDateFilterChange(val)}
          placeholder={hist.dateFilterAll || "All time"}
          triggerClassName="w-full sm:!min-w-[140px] text-sm"
          dropdownClassName="min-w-[160px]"
        />
      </div>

      <div className="w-full sm:w-auto">
        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val)}
          placeholder={hist.statusFilterAll || "All statuses"}
          triggerClassName="w-full sm:!min-w-[160px] text-sm"
          dropdownClassName="min-w-[180px]"
        />
      </div>
    </div>
  )
}

export default BillingFilters
