import React, { createContext, useContext, useState, useCallback } from "react"
import { INITIAL_USER_PLAN, INITIAL_INVOICES, PLANS } from "../mock/data"

const BillingContext = createContext(null)

export const useBilling = () => {
  const context = useContext(BillingContext)
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider")
  }
  return context
}

export const BillingProvider = ({ children }) => {
  const [currentPlanId, setCurrentPlanId] = useState(INITIAL_USER_PLAN)
  const [invoices, setInvoices] = useState(INITIAL_INVOICES)
  const [isProcessing, setIsProcessing] = useState(false)

  const upgradeToPro = useCallback(async () => {
    setIsProcessing(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setCurrentPlanId("pro")
    
    const newInvoice = {
      id: `inv_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
      planName: PLANS.pro.name,
      amount: PLANS.pro.price,
      status: "paid",
    }
    
    setInvoices((prev) => [newInvoice, ...prev])
    setIsProcessing(false)
  }, [])

  const downgradeToFree = useCallback(async () => {
    setIsProcessing(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setCurrentPlanId("free")
    
    const newInvoice = {
      id: `inv_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
      planName: "Prorated Refund",
      amount: -PLANS.pro.price, // Mock negative amount for refund
      status: "refunded",
    }
    
    setInvoices((prev) => [newInvoice, ...prev])
    setIsProcessing(false)
  }, [])

  const value = {
    currentPlan: PLANS[currentPlanId],
    currentPlanId,
    invoices,
    isProcessing,
    upgradeToPro,
    downgradeToFree,
    plans: PLANS,
  }

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  )
}
