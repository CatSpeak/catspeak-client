import React from "react"
import { useNavigate } from "react-router-dom"
import { Breadcrumb } from "@/shared/components/ui/navigation"

const CheckoutBreadcrumbs = ({ t, language }) => {
  const navigate = useNavigate()

  const breadcrumbItems = [
    {
      label: t.nav?.home || "Home",
      onClick: () => navigate(`/${language}/community`),
    },
    {
      label: t.nav?.pricing || "Pricing",
      onClick: () => navigate("/pricing"),
    },
    {
      label: t.billing?.checkoutModal?.title || "Thanh toán dịch vụ",
    },
  ]

  return (
    <div className="mb-6">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  )
}

export default CheckoutBreadcrumbs
