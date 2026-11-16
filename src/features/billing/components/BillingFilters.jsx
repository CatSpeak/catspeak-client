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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
      <div className="w-full sm:flex-1 sm:max-w-[360px]">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={hist.searchPlaceholder || "Enter invoice ID..."}
        />
      </div>

      <div className="flex gap-2">
        <Dropdown
          options={dateOptions}
          value={dateFilter}
          onChange={(val) => onDateFilterChange(val)}
          placeholder={hist.dateFilterAll || "All time"}
        />

        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val)}
          placeholder={hist.statusFilterAll || "All statuses"}
        />
      </div>
    </div>
  )
}

export default BillingFilters
