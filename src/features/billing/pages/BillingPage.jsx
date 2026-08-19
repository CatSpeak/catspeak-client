import React from "react"
import { useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs } from "@/shared/components/ui/navigation"
import PageTitle from "@/shared/components/ui/PageTitle"
import PaymentHistoryTab from "../components/PaymentHistoryTab"
import RefundHistoryTab from "../components/RefundHistoryTab"
import PlanUsageTab from "./PlanUsageTab"
import { Gauge, Receipt, RotateCcw } from "lucide-react"

const VALID_TABS = ["usage", "payments", "refunds"]

const BillingPage = () => {
  const { t } = useLanguage()
  const hist = t.billing?.history || {}
  const refundT = t.refunds || {}
  const pu = t?.planUsage || {}

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : "usage"

  const navTabs = [
    {
      id: "usage",
      label: pu.tabUsage || "Hạn Ngạch & Gói",
      icon: Gauge,
    },
    {
      id: "payments",
      label: hist.title || "Lịch sử thanh toán",
      icon: Receipt,
    },
    {
      id: "refunds",
      label: refundT.title || "Lịch sử hoàn tiền",
      icon: RotateCcw,
    },
  ]

  const getPageTitle = () => {
    switch (activeTab) {
      case "payments":
        return hist.title || "Lịch sử thanh toán"
      case "refunds":
        return refundT.title || "Lịch sử hoàn tiền"
      case "usage":
      default:
        return pu.pageTitle || "Quản Lý Gói Dịch Vụ & Hạn Ngạch"
    }
  }

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "payments":
        return hist.subtitle || "Xem lại lịch sử các giao dịch và hóa đơn thanh toán của bạn."
      case "refunds":
        return refundT.subtitle || "Theo dõi tình trạng các yêu cầu hoàn tiền của bạn."
      case "usage":
      default:
        return pu.pageSubtitle || "Theo dõi hạn ngạch sử dụng thực tế và quản lý gói dịch vụ của bạn."
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-70px)]">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1">
        <PageTitle>{getPageTitle()}</PageTitle>
        <p className="text-gray-500 text-sm">{getPageSubtitle()}</p>
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
      {activeTab === "usage" && <PlanUsageTab />}
      {activeTab === "payments" && <PaymentHistoryTab />}
      {activeTab === "refunds" && <RefundHistoryTab />}
    </div>
  )
}

export default BillingPage
