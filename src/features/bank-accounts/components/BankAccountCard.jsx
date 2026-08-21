import React, { useState, useEffect } from "react"
import { Trash2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentCard from "@/shared/components/ui/FluentCard"
import { Badge } from "@/shared/components/ui/indicators"
import Radio from "@/shared/components/ui/inputs/Radio"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import BankCardBackground from "./BankCardBackground"
import { formatAccountNumber } from "../utils/bankAccountUtils"
import {
  useSetDefaultInstructorBankAccountMutation,
  useDeleteInstructorBankAccountMutation,
} from "../api/instructorBankAccountsApi"

export default function BankAccountCard({ account }) {
  const { t } = useLanguage()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isOptimisticDefault, setIsOptimisticDefault] = useState(false)

  const [setDefaultAccount, { isLoading: isSettingDefault }] =
    useSetDefaultInstructorBankAccountMutation()
  const [deleteAccount] = useDeleteInstructorBankAccountMutation()

  const {
    id,
    bankShortName,
    bankFullName,
    accountNumber,
    accountHolderName,
    isVerified,
    isDefault,
  } = account || {}

  // Sync optimistic state when server isDefault prop updates
  useEffect(() => {
    if (isDefault) {
      setIsOptimisticDefault(false)
    }
  }, [isDefault])

  const effectiveIsDefault = isDefault || isOptimisticDefault

  const handleSetDefault = async (e) => {
    if (e) e.stopPropagation()
    if (effectiveIsDefault || isSettingDefault) return
    setIsOptimisticDefault(true)
    try {
      await setDefaultAccount(id).unwrap()
    } catch (err) {
      setIsOptimisticDefault(false)
      toast.error(err?.data?.message || t?.bankAccounts?.errorSetDefault || "Không thể cài làm mặc định")
    }
  }

  const handleDeleteClick = (e) => {
    if (e) e.stopPropagation()
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount(id).unwrap()
      setIsDeleteModalOpen(false)
    } catch (err) {
      toast.error(err?.data?.message || t?.bankAccounts?.errorDelete || "Không thể xóa tài khoản ngân hàng")
    } finally {
      setIsDeleting(false)
    }
  }

  const bankDisplayName = bankShortName || bankFullName || t?.bankAccounts?.defaultBankFallback || "Ngân hàng"

  return (
    <>
      <FluentCard
        padding="p-4"
        className={`group relative justify-between transition-all duration-300 ease-in-out border-transparent overflow-hidden ${
          effectiveIsDefault
            ? "shadow-xl cursor-default border-t border-white/40 ring-2 ring-white/30"
            : "hover:shadow-lg cursor-pointer hover:border-white/30"
        }`}
        onClick={effectiveIsDefault ? undefined : handleSetDefault}
      >
        <BankCardBackground id={id} />

        {/* Content: Crisp White Text for ALL Cards */}
        <div className="relative z-10 flex flex-col gap-4 justify-between h-full text-white">
          {/* Section 1: Header (Bank Name, Radio & Status Badge) */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Radio
                checked={effectiveIsDefault}
                variant="white"
                disabled={isSettingDefault}
                onChange={handleSetDefault}
              />

              <div className="flex flex-col min-w-0 flex-1">
                <p
                  className="font-bold truncate text-white"
                  title={bankShortName || bankFullName}
                >
                  {bankDisplayName}
                </p>
                {bankFullName && bankFullName !== bankShortName && (
                  <p
                    className="text-sm truncate text-white/80"
                    title={bankFullName}
                  >
                    {bankFullName}
                  </p>
                )}
              </div>
            </div>

            {/* Badges container */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {isVerified ? (
                <Badge color="white">{t?.bankAccounts?.verified || "Đã xác thực"}</Badge>
              ) : (
                <Badge color="white">{t?.bankAccounts?.unverified || "Chưa xác thực"}</Badge>
              )}
            </div>
          </div>

          {/* Section 2: Card Details (Account Number & Holder Name) */}
          <div className="relative flex flex-col gap-2">
            <div>
              <span className="text-sm truncate text-white/80">
                {t?.bankAccounts?.accountNumber || "Số tài khoản"}
              </span>
              <p className="font-mono font-bold tracking-widest text-white truncate">
                {formatAccountNumber(accountNumber)}
              </p>
            </div>

            {accountHolderName && (
              <div>
                <span className="text-sm truncate text-white/80">
                  {t?.bankAccounts?.accountHolder || "Chủ tài khoản"}
                </span>
                <p className="truncate text-white">{accountHolderName}</p>
              </div>
            )}
          </div>

          {/* Section 3: Card Footer (Delete Action) */}
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              onClick={handleDeleteClick}
              disabled={isDeleting}
              variant="overlay"
              size="sm"
              title={t?.bankAccounts?.deleteTooltip || "Xóa tài khoản"}
              className="!text-white hover:!bg-white/20"
            >
              {isDeleting ? (
                <Loader2 className="animate-spin h-3.5 w-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </IconButton>
          </div>
        </div>
      </FluentCard>

      {/* Confirmation Modal for Bank Account Deletion */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t?.bankAccounts?.deleteTitle || "Xóa tài khoản ngân hàng"}
        message={
          t?.bankAccounts?.deleteConfirmMessage
            ? t.bankAccounts.deleteConfirmMessage
                .replace("{bank}", bankDisplayName)
                .replace("{accountNumber}", formatAccountNumber(accountNumber))
            : `Bạn có chắc chắn muốn xóa tài khoản ${bankDisplayName} (${formatAccountNumber(accountNumber)})?`
        }
        confirmText={t?.bankAccounts?.deleteConfirmBtn || "Xóa tài khoản"}
        cancelText={t?.bankAccounts?.cancelBtn || "Hủy"}
        confirmVariant="destructive"
        isPending={isDeleting}
      />
    </>
  )
}

