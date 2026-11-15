import React from "react"
import { useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Tabs, TabContent } from "@/shared/components/ui/navigation"
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

  const handleTabChange = (nextTab) => {
    setSearchParams({ tab: nextTab })
  }

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
        return (
          hist.subtitle ||
          "Xem lại lịch sử các giao dịch và hóa đơn thanh toán của bạn."
        )
      case "refunds":
        return (
          refundT.subtitle ||
          "Theo dõi tình trạng các yêu cầu hoàn tiền của bạn."
        )
      case "usage":
      default:
        return (
          pu.pageSubtitle ||
          "Theo dõi hạn ngạch sử dụng thực tế và quản lý gói dịch vụ của bạn."
        )
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 p-4">
        <PageTitle>{getPageTitle()}</PageTitle>
        <p className="text-gray-500 dark:text-neutral-400 text-sm">
          {getPageSubtitle()}
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={navTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        fullWidth={false}
      />

      {/* Active Tab Content */}
      <div className="p-4 pb-24">
        <TabContent
          activeTab={activeTab}
          tabOrder={VALID_TABS}
          className="w-full"
        >
          {activeTab === "usage" && <PlanUsageTab />}
          {activeTab === "payments" && <PaymentHistoryTab />}
          {activeTab === "refunds" && <RefundHistoryTab />}
        </TabContent>
      </div>
    </div>
  )
}

export default BillingPage
