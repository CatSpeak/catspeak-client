import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useCheckoutMutation } from "@/store/api/paymentsApi"
import { Loader2 } from "lucide-react"

import CheckoutBreadcrumbs from "../checkout/components/CheckoutBreadcrumbs"
import RecipientInfoBox from "../checkout/components/RecipientInfoBox"
import BuyerInfoBox from "../checkout/components/BuyerInfoBox"
import PaymentMethodSelector from "../checkout/components/PaymentMethodSelector"
import PaymentSummaryBox from "../checkout/components/PaymentSummaryBox"

const removeVietnameseTones = (str) => {
  if (!str) return ""
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
}

const formatTransferMemo = (userFullName, planName) => {
  const cleanUser = removeVietnameseTones(userFullName || "").toUpperCase()
  const cleanPlan = removeVietnameseTones(planName || "").toUpperCase()
  return `${cleanUser} NANG GOI ${cleanPlan}`.trim()
}

const CheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const plan = location.state?.plan

  const { user: authUser } = useAuth()
  const { data: profileResponse, isLoading: isProfileLoading } =
    useGetUserProfileQuery()
  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation()

  const currentUser = profileResponse?.data || authUser

  const initialUserFullName =
    currentUser?.fullName ||
    currentUser?.fullname ||
    currentUser?.username ||
    currentUser?.nickname ||
    currentUser?.name ||
    ""

  // State values for buyer information - default to current user's values
  const [fullName, setFullName] = useState(initialUserFullName)
  const [email, setEmail] = useState(currentUser?.email || "")
  const [phone, setPhone] = useState(
    currentUser?.phoneNumber || currentUser?.phone || "",
  )
  const [memo, setMemo] = useState(
    initialUserFullName && plan?.name
      ? formatTransferMemo(initialUserFullName, plan.name)
      : "",
  )
  const [selectedMethod, setSelectedMethod] = useState("payos")

  // Redirect if no plan selected
  useEffect(() => {
    if (!plan) {
      navigate("/pricing")
    }
  }, [plan, navigate])

  // Prefill user details and memo when loaded
  useEffect(() => {
    const user = profileResponse?.data || authUser
    if (user) {
      const userFullName =
        user.fullName ||
        user.fullname ||
        user.username ||
        user.nickname ||
        user.name ||
        ""
      const userEmail = user.email || ""
      const userPhone = user.phoneNumber || user.phone || ""

      /* eslint-disable react-hooks/set-state-in-effect */
      setFullName(userFullName)
      setEmail(userEmail)
      setPhone(userPhone)

      const transferMemo = formatTransferMemo(
        userFullName || "USER",
        plan?.name || "CAT SPEAK",
      )
      setMemo(transferMemo)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [profileResponse, authUser, plan])


  if (!plan) return null

  const handleCheckoutSubmit = async () => {
    try {
      const response = await checkout({
        planId: plan.id,
        returnUrl: `${window.location.origin}/billing/result`,
        cancelUrl: `${window.location.origin}/billing/result`,
      }).unwrap()

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      }
    } catch (error) {
      console.error("Failed to checkout", error)
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-cath-red-700 animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium">
          {t.billing?.pricing?.processing || "Đang tải..."}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto px-12 pt-6 pb-16 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs */}
      <CheckoutBreadcrumbs t={t} language={language} />

      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight text-gray-900">
        {t.billing?.checkout?.title || "Thanh toán dịch vụ"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns (Form details) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Transfer Info Section */}
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t.billing?.checkout?.transferInfo || "Thông tin chuyển khoản"}
            </h2>

            {/* Recipient details */}
            <RecipientInfoBox
              t={t}
              memo={memo}
              onMemoChange={setMemo}
            />

            <hr className="border-border" />

            {/* Buyer details */}
            <BuyerInfoBox
              t={t}
              fullName={fullName}
              email={email}
              phone={phone}
              onFullNameChange={setFullName}
              onEmailChange={setEmail}
              onPhoneChange={setPhone}
            />
          </div>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            t={t}
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
          />
        </div>

        {/* Right Column (Summary detail) */}
        <div className="lg:col-span-1">
          <PaymentSummaryBox
            t={t}
            language={language}
            plan={plan}
            isProcessing={isCheckoutLoading}
            onSubmit={handleCheckoutSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
