import React, { useState } from "react"
import SubscriptionView from "../subscription/components/SubscriptionView"
import PaymentHistoryView from "../invoices/components/PaymentHistoryView"

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState("subscription") // 'subscription' | 'history'

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full">
      <div className="mb-8 border-b border-[#E5E5E5] flex gap-8">
        <button
          onClick={() => setActiveTab("subscription")}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "subscription"
              ? "text-cath-red-700"
              : "text-[#7A7574] hover:text-[#333]"
          }`}
        >
          Subscription
          {activeTab === "subscription" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cath-red-700 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 text-sm font-semibold transition-colors relative ${
            activeTab === "history"
              ? "text-cath-red-700"
              : "text-[#7A7574] hover:text-[#333]"
          }`}
        >
          Payment History
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cath-red-700 rounded-t-full" />
          )}
        </button>
      </div>

      <div className="mt-8">
        {activeTab === "subscription" ? <SubscriptionView /> : <PaymentHistoryView />}
      </div>
    </div>
  )
}

export default BillingPage
