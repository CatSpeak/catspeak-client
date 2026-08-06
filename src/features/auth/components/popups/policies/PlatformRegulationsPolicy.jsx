import React, { useState } from "react"
import PrivacyPolicy from "./PrivacyPolicy"
import TermsOfService from "./TermsOfService"
import PaymentPolicy from "./PaymentPolicy"
import IntellectualPropertyPolicy from "./IntellectualPropertyPolicy"

const PlatformRegulationsPolicy = () => {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { id: "tos", label: "Điều khoản dịch vụ", component: TermsOfService },
    { id: "privacy", label: "Chính sách bảo mật", component: PrivacyPolicy },
    { id: "payment", label: "Chính sách thanh toán", component: PaymentPolicy },
    { id: "ip", label: "Bản quyền sở hữu trí tuệ", component: IntellectualPropertyPolicy },
  ]

  const ActiveComponent = tabs[activeTab].component

  return (
    <div className="flex flex-col h-full mt-2">
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto custom-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(index)}
            className={`whitespace-nowrap py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === index
                ? "border-[#8f0d15] text-[#8f0d15]"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <ActiveComponent />
      </div>
    </div>
  )
}

export default PlatformRegulationsPolicy
