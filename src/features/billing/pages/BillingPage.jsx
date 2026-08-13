import React from "react"
import { useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs } from "@/shared/components/ui/navigation"
import PageTitle from "@/shared/components/ui/PageTitle"
import PaymentHistoryTab from "../components/PaymentHistoryTab"
import RefundHistoryTab from "../components/RefundHistoryTab"

const BillingPage = () => {
  const { t } = useLanguage()
  const hist = t.billing?.history || {}
  const refundT = t.refunds || {}

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab =
    searchParams.get("tab") === "refunds" ? "refunds" : "payments"

  const navTabs = [
    { id: "payments", label: hist.title || "Lịch sử thanh toán" },
    { id: "refunds", label: refundT.title || "Lịch sử hoàn tiền" },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-70px)]">
      {/* Header */}
      <div className="mb-6">
        <PageTitle>
          {activeTab === "payments"
            ? hist.title || "Lịch sử thanh toán"
            : refundT.title || "Lịch sử hoàn tiền"}
        </PageTitle>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={navTabs}
        activeTab={activeTab}
        onChange={(id) => setSearchParams({ tab: id })}
        fullWidth={false}
        className="mb-6"
      />

      {/* Active Tab Content */}
      {activeTab === "payments" ? <PaymentHistoryTab /> : <RefundHistoryTab />}
    </div>
  )
}

export default BillingPage
