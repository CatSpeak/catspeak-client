import React from "react"
import { BillingProvider } from "./context/BillingContext"
import BillingPage from "./pages/BillingPage"

export const BillingFeature = () => {
  return (
    <BillingProvider>
      <BillingPage />
    </BillingProvider>
  )
}

export default BillingFeature
