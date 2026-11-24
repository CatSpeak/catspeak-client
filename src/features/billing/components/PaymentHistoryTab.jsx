import React, { useState, useMemo } from "react"
import {
  useGetPaymentHistoryQuery,
  useRepayMutation,
} from "@/store/api/paymentsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Pagination } from "@/shared/components/ui/navigation"
import BillingFilters from "./BillingFilters"
import BillingTable from "./BillingTable"
import ReportIssueModal from "../invoices/components/ReportIssueModal"
import RequestRefundModal from "@/features/refunds/components/RequestRefundModal"

import { useTimezone } from "@/shared/hooks/useTimezone"
import PaymentHistorySkeleton from "./PaymentHistorySkeleton"
import { useSubmitLock } from "@/shared/hooks/useSubmitLock"

const ITEMS_PER_PAGE = 5

export default function PaymentHistoryTab() {
  const { t } = useLanguage()
  const { parseIsoToZoneDate } = useTimezone()
  const hist = t.billing?.history || {}

  const STATUS_MAP = {
    1: {
      label: hist.statuses?.success || "Success",
      styles: "bg-[#E5F7ED] dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400 border border-green-200/60 dark:border-emerald-900/40",
    },
    2: {
      label: hist.statuses?.failed || "Failed",
      styles: "bg-[#FDE8E8] dark:bg-rose-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-rose-900/40",
    },
    3: {
      label: hist.statuses?.pending || "Pending",
      styles: "bg-[#FFFBEA] dark:bg-amber-950/40 text-yellow-700 dark:text-amber-400 border border-yellow-200/60 dark:border-amber-900/40",
    },
    4: {
      label: hist.statuses?.refunded || "Refunded",
      styles: "bg-[#EBF5FF] dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40",
    },
    0: {
      label: hist.statuses?.cancelled || "Cancelled",
      styles: "bg-[#F3F3F3] dark:bg-neutral-800 text-[#7A7574] dark:text-neutral-300 border border-gray-200 dark:border-neutral-700",
    },
  }

  const { data: invoices = [], isLoading } = useGetPaymentHistoryQuery()
  const [repay] = useRepayMutation()

  // State for modals & actions
  const [reportTargetPaymentId, setReportTargetPaymentId] = useState(null)
  const [refundTargetInvoice, setRefundTargetInvoice] = useState(null)
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
        !searchQuery ||
        inv.orderCode?.toString().toLowerCase().includes(searchStr)

      const matchesStatus =
        statusFilter === "all" || inv.status.toString() === statusFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const invDate =
          parseIsoToZoneDate(inv.createDate) || new Date(inv.createDate)
        const now = new Date()
        if (dateFilter === "week") {
          matchesDate =
            invDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (dateFilter === "month") {
          matchesDate =
            invDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [invoices, searchQuery, statusFilter, dateFilter, parseIsoToZoneDate])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE),
  )
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

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

  const handleRefund = (invoice) => {
    setRefundTargetInvoice(invoice)
  }

  const { runLocked } = useSubmitLock()

  const handleRepay = async (invoice) => {
    await runLocked(async () => {
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
    })
  }

  if (isLoading) {
    return <PaymentHistorySkeleton />
  }

  return (
    <div className="!justify-start min-h-[500px]">
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
        onRefund={handleRefund}
        repayingId={repayingId}
        t={t}
      />

      {/* Pagination */}
      {filteredInvoices.length > ITEMS_PER_PAGE && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChangePage={setCurrentPage}
        />
      )}

      {/* Report Issue Modal */}
      {Boolean(reportTargetPaymentId) && (
        <ReportIssueModal
          isOpen={Boolean(reportTargetPaymentId)}
          paymentId={reportTargetPaymentId}
          onClose={() => setReportTargetPaymentId(null)}
        />
      )}

      {/* Request Refund Modal */}
      {Boolean(refundTargetInvoice) && (
        <RequestRefundModal
          isOpen={Boolean(refundTargetInvoice)}
          paymentId={refundTargetInvoice?.paymentId}
          orderCode={refundTargetInvoice?.orderCode}
          onClose={() => setRefundTargetInvoice(null)}
        />
      )}
    </div>
  )
}
