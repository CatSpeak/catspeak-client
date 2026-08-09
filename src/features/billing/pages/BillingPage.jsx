import React, { useState, useMemo } from "react"
import { useGetPaymentHistoryQuery, useRepayMutation } from "@/store/api/paymentsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Pagination } from "@/shared/components/ui/navigation"
import BillingFilters from "../components/BillingFilters"
import BillingTable from "../components/BillingTable"
import ReportIssueModal from "../invoices/components/ReportIssueModal"

const ITEMS_PER_PAGE = 5

const BillingPage = () => {
  const { t } = useLanguage()
  const hist = t.billing?.history || {}

  const STATUS_MAP = {
    1: { label: hist.statuses?.success || "Success", styles: "bg-[#E5F7ED] text-green-700" },
    3: { label: hist.statuses?.pending || "Pending", styles: "bg-[#FFFBEA] text-yellow-700" },
    0: { label: hist.statuses?.cancelled || "Cancelled", styles: "bg-[#F3F3F3] text-[#7A7574]" },
  }

  const { data: invoices = [], isLoading } = useGetPaymentHistoryQuery()
  const [repay] = useRepayMutation()

  // State for modals & actions
  const [reportTargetPaymentId, setReportTargetPaymentId] = useState(null)
  const [repayingId, setRepayingId] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const searchStr = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery || inv.orderCode?.toString().toLowerCase().includes(searchStr)

      const matchesStatus =
        statusFilter === "all" || inv.status.toString() === statusFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const invDate = new Date(inv.createDate)
        const now = new Date()
        if (dateFilter === "week") {
          matchesDate = invDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (dateFilter === "month") {
          matchesDate = invDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, searchQuery, statusFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE))
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Reset page when filters change
  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }
  const handleDateFilterChange = (val) => {
    setDateFilter(val)
    setCurrentPage(1)
  }
  const handleStatusFilterChange = (val) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handleReport = (invoice) => {
    setReportTargetPaymentId(invoice.paymentId || invoice.orderCode)
  }

  const handleRepay = async (invoice) => {
    try {
      setRepayingId(invoice.paymentId)
      const res = await repay({
        paymentId: invoice.paymentId,
        returnUrl: `${window.location.origin}/billing/result`,
        cancelUrl: `${window.location.origin}/billing/result`,
      }).unwrap()

      const checkoutUrl = res?.checkoutUrl || res?.data?.checkoutUrl
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (err) {
      console.error("Failed to repay order:", err)
    } finally {
      setRepayingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-cath-red-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-[calc(100vh-70px)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cath-red-700 mb-1">
          {hist.title || "Payment History"}
        </h2>
        <p className="text-gray-500 text-sm">
          {hist.subtitle || "View your past invoices and billing history."}
        </p>
      </div>

      <div className=" !justify-start gap-6 min-h-[500px]">
        {/* Filters */}
        <BillingFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          t={t}
        />

        {/* Table */}
        <BillingTable
          invoices={paginatedInvoices}
          statusMap={STATUS_MAP}
          onReport={handleReport}
          onRepay={handleRepay}
          repayingId={repayingId}
          t={t}
        />

        {/* Pagination — only show when more than 5 items */}
        {filteredInvoices.length > ITEMS_PER_PAGE && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChangePage={setCurrentPage}
          />
        )}
      </div>

      {/* Report Issue Modal */}
      {Boolean(reportTargetPaymentId) && (
        <ReportIssueModal
          isOpen={Boolean(reportTargetPaymentId)}
          paymentId={reportTargetPaymentId}
          onClose={() => setReportTargetPaymentId(null)}
        />
      )}
    </div>
  )
}

export default BillingPage
