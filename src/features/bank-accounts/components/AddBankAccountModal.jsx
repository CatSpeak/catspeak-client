import React, { useState } from "react"
import { AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Building2,
  ChevronRight,
  ArrowLeft,
  Loader2,
  SearchX,
} from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import ListItem from "@/shared/components/ui/ListItem"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { EmptyState } from "@/shared/components/ui/indicators"
import BankListSkeleton from "./BankListSkeleton"
import useDebounce from "@/shared/hooks/useDebounce"
import useBankVerification from "../hooks/useBankVerification"
import {
  sanitizeAccountNumber,
  isValidAccountNumber,
  normalizeAccountHolderName,
  isValidAccountHolderName,
} from "../utils/bankAccountUtils"
import {
  useGetBanksQuery,
  useAddInstructorBankAccountMutation,
} from "../api/instructorBankAccountsApi"

function BankLogo({ logo, name }) {
  const [hasError, setHasError] = useState(false)

  if (logo && !hasError) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setHasError(true)}
        className="w-14 h-14 object-contain shrink-0 border border-border rounded-xl p-1 bg-white"
      />
    )
  }

  return (
    <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl border border-border bg-white">
      <Building2 className="w-6 h-6 text-neutral-400" />
    </div>
  )
}

export default function AddBankAccountModal({ isOpen, onClose }) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1) // 1: Select Bank, 2: Account Number & Verify
  const [direction, setDirection] = useState(1) // 1: Next, -1: Back
  const [selectedBank, setSelectedBank] = useState(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const debouncedQuery = useDebounce(searchQuery.trim(), 300)
  const isDebouncing = searchQuery.trim() !== debouncedQuery

  const goToStep = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    isFetching: isFetchingBanks,
  } = useGetBanksQuery(debouncedQuery, { skip: !isOpen })

  const isListLoading = isLoadingBanks || isFetchingBanks || isDebouncing

  // Encapsulated silent debounced verification hook
  const {
    verifiedName,
    verifyError,
    isChecking,
    isVerifying,
    resetVerification,
  } = useBankVerification(selectedBank, accountNumber, isOpen && step === 2)

  const [addBankAccount, { isLoading: isAdding }] =
    useAddInstructorBankAccountMutation()

  const resetForm = () => {
    setStep(1)
    setSelectedBank(null)
    setAccountNumber("")
    setAccountHolderName("")
    setIsDefault(false)
    setSearchQuery("")
    resetVerification()
  }

  const handleCloseModal = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!selectedBank) {
      toast.error(t?.bankAccounts?.modal?.errorSelectBank || "Vui lòng chọn ngân hàng")
      return
    }
    const cleanedAccount = sanitizeAccountNumber(accountNumber)
    if (!isValidAccountNumber(cleanedAccount)) {
      toast.error(t?.bankAccounts?.modal?.errorMinLength || "Số tài khoản phải có từ 6 đến 34 ký tự")
      return
    }
    const finalHolderName = (verifiedName || accountHolderName).trim()
    const normalizedHolderName = normalizeAccountHolderName(finalHolderName)
    if (!isValidAccountHolderName(normalizedHolderName)) {
      toast.error(t?.bankAccounts?.modal?.errorAccountHolder || "Vui lòng nhập tên chủ tài khoản (2 đến 70 ký tự)")
      return
    }
    try {
      await addBankAccount({
        bankBin: selectedBank.bin,
        accountNumber: cleanedAccount,
        accountHolderName: normalizedHolderName,
        isDefault,
      }).unwrap()

      handleCloseModal()
    } catch (err) {
      toast.error(err?.data?.message || t?.bankAccounts?.modal?.errorAdd || "Không thể thêm tài khoản ngân hàng")
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
          {t?.bankAccounts?.modal?.backBtn || "Quay lại"}
        </PillButton>
        <PillButton
          variant="primary"
          onClick={handleSubmit}
          loading={isAdding}
          disabled={
            !selectedBank ||
            !isValidAccountNumber(sanitizeAccountNumber(accountNumber)) ||
            isChecking ||
            isVerifying ||
            !(
              verifiedName ||
              isValidAccountHolderName(
                normalizeAccountHolderName(accountHolderName),
              )
            )
          }
          className="min-w-[130px]"
        >
          {t?.bankAccounts?.modal?.addBtn || "Thêm tài khoản"}
        </PillButton>
      </div>
    )

  return (
    <Modal
      open={isOpen}
      onClose={handleCloseModal}
      title={t?.bankAccounts?.modal?.title || "Thêm tài khoản ngân hàng"}
      footer={modalFooter}
      bodyClassName="flex-1 min-h-0 flex flex-col overflow-hidden"
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
            className="w-full flex-1 min-h-0 flex flex-col"
          >
            {/* Search Input */}
            <div className="shrink-0 mb-4 px-4 sm:px-6">
              <SearchInput
                placeholder={t?.bankAccounts?.modal?.searchPlaceholder || "Tìm kiếm tên hoặc mã ngân hàng..."}
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full min-w-0 sm:min-w-0 h-11 text-sm"
              />
            </div>

            {/* Scrollable Bank List */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 sm:px-6">
              {isListLoading ? (
                <BankListSkeleton />
              ) : banks.length === 0 ? (
                <EmptyState
                  variant="component"
                  className="py-8"
                  icon={searchQuery ? SearchX : Building2}
                  title={
                    searchQuery
                      ? (t?.bankAccounts?.modal?.notFound
                          ? t.bankAccounts.modal.notFound.replace("{query}", searchQuery)
                          : `Không tìm thấy kết quả cho "${searchQuery}"`)
                      : (t?.bankAccounts?.modal?.noBanks || "Chưa có danh sách ngân hàng")
                  }
                />
              ) : (
                <div className="flex flex-col gap-1 pb-2">
                  {banks.map((bank) => (
                    <ListItem
                      key={bank.id || bank.bin}
                      onClick={() => handleSelectBank(bank)}
                      hoverEffect
                      lines={2}
                      className="rounded-xl"
                      contentClassName="rounded-xl"
                      leftContent={
                        <BankLogo
                          logo={bank.logo}
                          name={bank.shortName || bank.name}
                        />
                      }
                      rightContent={
                        <ChevronRight className="text-neutral-400" />
                      }
                    >
                      <p className="truncate">{bank.shortName}</p>
                      <p className="truncate">{bank.name}</p>
                    </ListItem>
                  ))}
                </div>
              )}
            </div>
          </FluentAnimation>
        ) : (
          /* Step 2: Account Details & Verification */
          <FluentAnimation
            key="step2"
            animationKey="step2"
            direction={direction === 1 ? "left" : "right"}
            distance={24}
            exit
            className="w-full flex-1 min-h-0 overflow-y-auto overscroll-y-contain pt-1 px-4 sm:px-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6 pb-2">
              {/* Selected Bank Header */}
              {selectedBank && (
                <div className="flex items-center gap-4">
                  <BankLogo
                    logo={selectedBank.logo}
                    name={selectedBank.shortName || selectedBank.name}
                  />
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
                      {t?.bankAccounts?.modal?.accountNumberLabel || "Số tài khoản ngân hàng"}{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder={
                    t?.bankAccounts?.modal?.accountNumberPlaceholder ||
                    "Nhập số tài khoản (ví dụ: 1028681234)"
                  }
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(sanitizeAccountNumber(e.target.value))
                  }
                  autoCapitalize="characters"
                  variant="semi-round"
                  helperText={
                    verifyError && !verifiedName && !isVerifying && !isChecking
                      ? verifyError
                      : undefined
                  }
                  helperTextClassName="text-amber-600"
                  rightIcon={
                    isVerifying || isChecking ? (
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
                        {t?.bankAccounts?.modal?.verifiedOwnerTitle || "Tên chủ tài khoản đã xác thực"}
                      </p>
                      <p className="text-base font-bold tracking-wide uppercase text-neutral-900 dark:text-white">
                        {verifiedName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Account Holder Name (when auto-lookup fails or is unavailable) */}
              {!verifiedName && (
                <div>
                  <TextInput
                    label={
                      <span>
                        {t?.bankAccounts?.modal?.accountHolderLabel || "Tên chủ tài khoản"}{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder={
                      t?.bankAccounts?.modal?.accountHolderPlaceholder ||
                      "Nhập tên chủ tài khoản (ví dụ: NGUYEN VAN A)"
                    }
                    value={accountHolderName}
                    onChange={(e) =>
                      setAccountHolderName(
                        e.target.value
                          .replace(/đ/g, "D")
                          .replace(/Đ/g, "D")
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .toUpperCase()
                          .slice(0, 70),
                      )
                    }
                    variant="semi-round"
                  />
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
                  {t?.bankAccounts?.modal?.defaultCheckboxLabel || "Đặt làm tài khoản mặc định nhận thanh toán"}
                </label>
              </div>
            </form>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </Modal>
  )
}
