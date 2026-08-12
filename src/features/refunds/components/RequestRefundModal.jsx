import React, { useState, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetBanksQuery } from "@/features/bank-accounts/api/instructorBankAccountsApi"
import RefundIneligibleModal from "./RefundIneligibleModal"
import RefundEligibleModal from "./RefundEligibleModal"
import RefundSuccessModal from "./RefundSuccessModal"
import {
  useCheckRefundEligibilityQuery,
  useRequestRefundMutation,
} from "../api/refundsApi"
import {
  AlertCircle,
  Loader2,
  Building2,
  ArrowLeft,
} from "lucide-react"

export default function RequestRefundModal({
  isOpen,
  onClose,
  paymentId,
  orderCode,
}) {
  const { t } = useLanguage()
  const refundT = t.refunds || {}

  // Steps: 'eligibility' | 'form' | 'success'
  const [step, setStep] = useState("eligibility")

  // Bank selection state
  const [bankSearch, setBankSearch] = useState("")
  const [selectedBank, setSelectedBank] = useState(null)
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false)

  // Form fields
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [reason, setReason] = useState("")
  const [formError, setFormError] = useState(null)

  // Eligibility query
  const {
    data: eligibility,
    isLoading: isCheckingEligibility,
    isError: isEligibilityError,
    refetch: refetchEligibility,
  } = useCheckRefundEligibilityQuery(paymentId, {
    skip: !isOpen || !paymentId,
  })

  // Banks query
  const { data: banks = [], isLoading: isLoadingBanks } = useGetBanksQuery(
    bankSearch.trim() || undefined,
    { skip: !isOpen },
  )

  // Mutation
  const [requestRefund, { isLoading: isSubmitting }] =
    useRequestRefundMutation()

  // Format currency
  const formatAmount = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0)

  // Reset modal on close
  const handleClose = () => {
    if (isSubmitting) return
    onClose()
    setTimeout(() => {
      setStep("eligibility")
      setSelectedBank(null)
      setBankSearch("")
      setAccountNumber("")
      setAccountHolderName("")
      setReason("")
      setFormError(null)
      setIsBankDropdownOpen(false)
    }, 300)
  }

  // Handle submit refund request
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const bankBin = selectedBank?.bin || selectedBank?.bankBin
    if (!bankBin) {
      setFormError(refundT.errorNoBank || "Vui lòng chọn ngân hàng.")
      return
    }
    if (!accountNumber.trim()) {
      setFormError(refundT.errorNoAccount || "Vui lòng nhập số tài khoản.")
      return
    }
    if (!accountHolderName.trim()) {
      setFormError(refundT.errorNoHolder || "Vui lòng nhập tên chủ tài khoản.")
      return
    }
    if (!reason.trim()) {
      setFormError(refundT.errorNoReason || "Vui lòng nhập lý do hoàn tiền.")
      return
    }

    try {
      await requestRefund({
        paymentId: Number(paymentId),
        bankBin: String(bankBin),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
        reason: reason.trim(),
      }).unwrap()

      setStep("success")
    } catch (err) {
      console.error("Refund request failed:", err)
      const msg =
        err?.data?.message ||
        err?.data?.data?.message ||
        refundT.errorSubmitFailed ||
        "Gửi yêu cầu hoàn tiền thất bại. Vui lòng thử lại."
      setFormError(msg)
    }
  }

  const isEligible = eligibility?.isEligible === true

  // Dedicated Ineligible Status Modal
  if (
    isOpen &&
    step === "eligibility" &&
    !isCheckingEligibility &&
    !isEligibilityError &&
    !isEligible
  ) {
    return (
      <RefundIneligibleModal
        isOpen={isOpen}
        onClose={handleClose}
        reason={eligibility?.reason}
      />
    )
  }

  // Dedicated Eligible Summary Modal
  if (
    isOpen &&
    step === "eligibility" &&
    !isCheckingEligibility &&
    !isEligibilityError &&
    isEligible
  ) {
    return (
      <RefundEligibleModal
        isOpen={isOpen}
        onClose={handleClose}
        onContinue={() => setStep("form")}
        eligibility={eligibility}
        orderCode={orderCode}
      />
    )
  }

  // Dedicated Success Modal
  if (isOpen && step === "success") {
    return <RefundSuccessModal isOpen={isOpen} onClose={handleClose} />
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={
        (refundT.requestRefundTitle || "Yêu cầu hoàn tiền") +
        (orderCode ? ` #${orderCode}` : "")
      }
      showCloseButton={!isSubmitting}
      className="max-w-lg"
    >
      {/* ── STEP 1: Loading & Query Error check ── */}
      {step === "eligibility" && (
        <div className="pb-4 space-y-5">
          {isCheckingEligibility ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="w-10 h-10 text-cath-red-700 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-600">
                {refundT.checkingEligibility ||
                  "Đang kiểm tra điều kiện hoàn tiền..."}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
              <p className="text-sm text-rose-700 font-medium">
                {refundT.checkEligibilityError ||
                  "Không thể kiểm tra điều kiện hoàn tiền. Vui lòng thử lại sau."}
              </p>
              <PillButton variant="secondary" onClick={refetchEligibility}>
                {refundT.btnRetry || "Thử lại"}
              </PillButton>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Bank Details Form ── */}
      {step === "form" && (
        <form onSubmit={handleSubmit} className="pb-4 space-y-4">
          {/* Back to eligibility info */}
          <button
            type="button"
            onClick={() => setStep("eligibility")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{refundT.btnBack || "Quay lại"}</span>
          </button>

          {/* Refund Amount Badge */}
          {eligibility?.maxRefundAmount > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {refundT.maxRefundAmount || "Số tiền hoàn"}
              </span>
              <span className="text-base font-bold text-cath-red-700">
                {formatAmount(eligibility.maxRefundAmount)}
              </span>
            </div>
          )}

          {/* Bank Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              {refundT.selectBank || "Ngân hàng nhận tiền"}{" "}
              <span className="text-cath-red-700">*</span>
            </label>

            {selectedBank ? (
              <div className="p-3 border border-gray-300 rounded-xl flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  {selectedBank.logo ? (
                    <img
                      src={selectedBank.logo}
                      alt={selectedBank.name || selectedBank.shortName}
                      className="w-8 h-8 object-contain rounded"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {selectedBank.shortName || selectedBank.name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedBank.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBank(null)
                    setIsBankDropdownOpen(true)
                  }}
                  className="text-xs text-cath-red-700 hover:underline font-semibold"
                >
                  {refundT.btnChangeBank || "Thay đổi"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <SearchInput
                  placeholder={
                    refundT.searchBankPlaceholder || "Tìm kiếm ngân hàng..."
                  }
                  value={bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value)
                    setIsBankDropdownOpen(true)
                  }}
                  onFocus={() => setIsBankDropdownOpen(true)}
                />

                {isBankDropdownOpen && (
                  <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg divide-y divide-gray-100">
                    {isLoadingBanks ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                        {refundT.loadingBanks || "Đang tải danh sách ngân hàng..."}
                      </div>
                    ) : banks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        {refundT.noBanksFound || "Không tìm thấy ngân hàng."}
                      </div>
                    ) : (
                      banks.map((bank) => (
                        <button
                          key={bank.bin || bank.id || bank.code}
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank)
                            setIsBankDropdownOpen(false)
                          }}
                          className="w-full text-left p-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          {bank.logo ? (
                            <img
                              src={bank.logo}
                              alt={bank.shortName}
                              className="w-7 h-7 object-contain rounded"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-gray-800 block">
                              {bank.shortName || bank.name}
                            </span>
                            <span className="text-[11px] text-gray-400 block truncate">
                              {bank.name}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              {refundT.accountNumber || "Số tài khoản"}{" "}
              <span className="text-cath-red-700">*</span>
            </label>
            <TextInput
              placeholder={
                refundT.accountNumberPlaceholder || "Nhập số tài khoản..."
              }
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, ""))
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              {refundT.accountHolderName || "Tên chủ tài khoản"}{" "}
              <span className="text-cath-red-700">*</span>
            </label>
            <TextInput
              placeholder={
                refundT.accountHolderPlaceholder ||
                "Nhập tên chủ tài khoản (viết hoa)..."
              }
              value={accountHolderName}
              onChange={(e) =>
                setAccountHolderName(e.target.value.toUpperCase())
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-700">
              {refundT.reasonLabel || "Lý do hoàn tiền"}{" "}
              <span className="text-cath-red-700">*</span>
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-800 transition-colors resize-none h-24"
              placeholder={
                refundT.reasonPlaceholder ||
                "Vui lòng mô tả lý do bạn muốn hoàn tiền..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Form Error */}
          {formError && (
            <p className="text-xs font-medium text-cath-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <PillButton
              variant="secondary"
              className="flex-1"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {refundT.btnCancel || "Hủy"}
            </PillButton>
            <PillButton type="submit" className="flex-1" loading={isSubmitting}>
              {refundT.btnSubmitRequest || "Gửi yêu cầu"}
            </PillButton>
          </div>
        </form>
      )}
    </Modal>
  )
}
