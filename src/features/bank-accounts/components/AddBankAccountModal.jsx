import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Building2,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import ListItem from "@/shared/components/ui/ListItem"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { Skeleton } from "@/shared/components/ui/indicators"
import useDebounce from "@/shared/hooks/useDebounce"
import {
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useAddInstructorBankAccountMutation,
} from "../api/instructorBankAccountsApi"

const BankListSkeleton = () => (
  <div className="flex flex-col gap-1 py-1">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="flex h-[72px] w-full items-center justify-between px-4 rounded-xl"
      >
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="h-[56px] w-[56px] shrink-0 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
        <Skeleton className="h-5 w-5 rounded-full shrink-0 bg-neutral-200 dark:bg-neutral-800" />
      </div>
    ))}
  </div>
)

export default function AddBankAccountModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1: Select Bank, 2: Account Number & Verify
  const [direction, setDirection] = useState(1) // 1: Next, -1: Back
  const [selectedBank, setSelectedBank] = useState(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [verifiedName, setVerifiedName] = useState("")
  const [verifyError, setVerifyError] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const debouncedQuery = useDebounce(searchQuery.trim(), 300)

  const goToStep = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    isFetching: isFetchingBanks,
  } = useGetBanksQuery(debouncedQuery, { skip: !isOpen })

  const [verifyBankAccount, { isLoading: isVerifying }] =
    useVerifyBankAccountMutation()
  const [addBankAccount, { isLoading: isAdding }] =
    useAddInstructorBankAccountMutation()

  const resetForm = () => {
    setStep(1)
    setSelectedBank(null)
    setAccountNumber("")
    setVerifiedName("")
    setVerifyError("")
    setIsDefault(false)
    setSearchQuery("")
  }

  const handleCloseModal = () => {
    resetForm()
    onClose()
  }

  // Silent debounced auto-verification
  useEffect(() => {
    const trimmed = accountNumber.trim()
    setVerifiedName("")
    setVerifyError("")

    if (!selectedBank || trimmed.length < 6) {
      return
    }

    const timer = setTimeout(async () => {
      try {
        const result = await verifyBankAccount({
          bankBin: selectedBank.bin,
          accountNumber: trimmed,
        }).unwrap()

        const holderName =
          result?.accountHolderName || result?.data?.accountHolderName || ""
        setVerifiedName(holderName)
        setVerifyError("")
      } catch (err) {
        setVerifiedName("")
        setVerifyError(
          err?.data?.message ||
            "Không thể xác thực số tài khoản. Vui lòng kiểm tra lại.",
        )
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [accountNumber, selectedBank, verifyBankAccount])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!selectedBank) {
      toast.error("Vui lòng chọn ngân hàng")
      return
    }
    if (!accountNumber.trim()) {
      toast.error("Vui lòng nhập số tài khoản")
      return
    }
    try {
      await addBankAccount({
        bankBin: selectedBank.bin,
        accountNumber: accountNumber.trim(),
        isDefault,
      }).unwrap()

      toast.success("Thêm tài khoản ngân hàng thành công!")
      handleCloseModal()
    } catch (err) {
      toast.error(err?.data?.message || "Không thể thêm tài khoản ngân hàng")
    }
  }

  const handleSelectBank = (bank) => {
    setSelectedBank(bank)
    goToStep(2)
  }

  const modalFooter =
    step === 1 ? null : (
      <div className="flex items-center justify-between gap-2 w-full">
        <PillButton
          variant="secondary"
          onClick={() => goToStep(1)}
          startIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Quay lại
        </PillButton>
        <PillButton
          variant="primary"
          onClick={handleSubmit}
          loading={isAdding}
          disabled={!selectedBank || !accountNumber.trim()}
          className="min-w-[130px]"
        >
          Thêm tài khoản
        </PillButton>
      </div>
    )

  return (
    <Modal
      open={isOpen}
      onClose={handleCloseModal}
      title="Thêm tài khoản ngân hàng"
      footer={modalFooter}
      bodyClassName="px-4 sm:px-6 flex-1 min-h-0 overflow-y-auto overscroll-y-contain overflow-x-hidden"
      className="md:max-w-lg h-[500px] sm:h-[540px]"
    >
      <AnimatePresence initial={false} mode="wait">
        {step === 1 ? (
          /* Step 1: Select Bank List */
          <FluentAnimation
            key="step1"
            animationKey="step1"
            direction={direction === 1 ? "left" : "right"}
            distance={24}
            exit
            className="w-full space-y-3"
          >
            <SearchInput
              placeholder="Tìm kiếm tên hoặc mã ngân hàng..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full min-w-0 sm:min-w-0 h-11 text-sm"
            />

            {isLoadingBanks || isFetchingBanks ? (
              <BankListSkeleton />
            ) : banks.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-500">
                {searchQuery
                  ? "Không tìm thấy ngân hàng phù hợp"
                  : "Chưa có danh sách ngân hàng"}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {banks.map((bank) => (
                  <ListItem
                    key={bank.id || bank.bin}
                    onClick={() => handleSelectBank(bank)}
                    hoverEffect
                    lines={2}
                    className="rounded-xl"
                    contentClassName="rounded-xl"
                    leftContent={
                      bank.logo ? (
                        <img
                          src={bank.logo}
                          alt={bank.shortName || bank.name}
                          className="border border-[#e5e5e5] rounded-xl p-1 bg-white"
                        />
                      ) : (
                        <Building2 className="text-neutral-400" />
                      )
                    }
                    rightContent={<ChevronRight className="text-neutral-400" />}
                  >
                    <p className="truncate">{bank.shortName}</p>
                    <p className="truncate">{bank.name}</p>
                  </ListItem>
                ))}
              </div>
            )}
          </FluentAnimation>
        ) : (
          /* Step 2: Account Number & Verification */
          <FluentAnimation
            key="step2"
            animationKey="step2"
            direction={direction === 1 ? "left" : "right"}
            distance={24}
            exit
            className="w-full"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Bank Header */}
              {selectedBank && (
                <div className="flex items-center gap-4">
                  {selectedBank.logo ? (
                    <img
                      src={selectedBank.logo}
                      alt={selectedBank.shortName || selectedBank.name}
                      className="w-14 h-14 object-contain shrink-0 border border-[#e5e5e5] rounded-xl p-1 bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl border border-[#e5e5e5] bg-white">
                      <Building2 className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">
                      {selectedBank.shortName}
                    </p>
                    <p className="text-sm text-[#606060] dark:text-neutral-400 truncate">
                      {selectedBank.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Number Input */}
              <div>
                <TextInput
                  label={
                    <span>
                      Số tài khoản ngân hàng{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="Nhập số tài khoản (ví dụ: 1028681234)"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  variant="semi-round"
                  helperText={
                    verifyError && !verifiedName && !isVerifying
                      ? "Không thể tự động tra cứu tên chủ tài khoản lúc này. Bạn vẫn có thể tiếp tục thêm tài khoản."
                      : undefined
                  }
                  helperTextClassName="text-amber-600"
                  rightIcon={
                    isVerifying ? (
                      <Loader2 className="animate-spin text-[#990011]" />
                    ) : verifiedName ? (
                      <CheckCircle2 className="text-emerald-500" />
                    ) : null
                  }
                />
              </div>

              {/* Verified Owner Name Card */}
              {verifiedName && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Tên chủ tài khoản đã xác thực
                      </p>
                      <p className="text-base font-bold tracking-wide uppercase text-neutral-900 dark:text-white">
                        {verifiedName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Default Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Đặt làm tài khoản mặc định nhận thanh toán
                </label>
              </div>
            </form>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </Modal>
  )
}
