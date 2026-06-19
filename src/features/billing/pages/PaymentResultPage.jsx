import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, Loader2 } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  useGetPaymentHistoryQuery,
  useCancelPaymentMutation,
} from "@/store/api/paymentsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

const PaymentResultPage = () => {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search)
  const isCancelled = searchParams.get("cancel") === "true"
  const orderCodeStr = searchParams.get("orderCode")
  const orderCode = orderCodeStr ? parseInt(orderCodeStr, 10) : null

  const { data: invoices = [], isLoading: isHistoryLoading } =
    useGetPaymentHistoryQuery()
  const [cancelPayment] = useCancelPaymentMutation()

  useEffect(() => {
    if (isCancelled && orderCode && invoices.length > 0) {
      const payment = invoices.find((inv) => inv.orderCode === orderCode)
      if (payment && payment.status === 3) {
        cancelPayment(payment.paymentId)
          .unwrap()
          .catch((error) => console.error("Failed to cancel payment", error))
          .finally(() => {
            navigate("/billing", { replace: true })
          })
      } else {
        navigate("/billing", { replace: true })
      }
    }
  }, [isCancelled, orderCode, invoices, cancelPayment, navigate])

  const handleReturn = () => {
    navigate("/billing")
  }

  if (isHistoryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-cath-red-700 animate-spin mb-4" />
        <p className="text-[#7A7574]">{t.billing.result.processing}</p>
      </div>
    )
  }

  const paymentRecord = invoices.find((inv) => inv.orderCode === orderCode)

  if (!isCancelled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-[#E5F7ED] text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">{t.billing.result.successTitle}</h1>
        <p className="text-[#7A7574] mb-8 text-center max-w-md">
          {t.billing.result.successSubtitle}
          {orderCode && (
            <span className="block mt-2 font-mono text-xs">
              Order Code: #{orderCode}
            </span>
          )}
        </p>
        <PillButton onClick={handleReturn} className="w-64">
          {t.billing.result.returnToBilling}
        </PillButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 text-cath-red-700 animate-spin mb-4" />
      <p className="text-[#7A7574]">{t.billing.result.cancelling}</p>
    </div>
  )
}

export default PaymentResultPage
