import React, { useState } from "react"
import { Building2, CheckCircle2, Star, Trash2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import FluentCard from "@/shared/components/ui/FluentCard"
import {
  useSetDefaultInstructorBankAccountMutation,
  useDeleteInstructorBankAccountMutation,
} from "../api/instructorBankAccountsApi"

export default function BankAccountCard({ account }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [setDefaultAccount, { isLoading: isSettingDefault }] =
    useSetDefaultInstructorBankAccountMutation()
  const [deleteAccount] = useDeleteInstructorBankAccountMutation()

  const {
    id,
    bankBin,
    bankShortName,
    bankFullName,
    accountNumber,
    accountHolderName,
    isVerified,
    isDefault,
  } = account || {}

  const handleSetDefault = async () => {
    try {
      await setDefaultAccount(id).unwrap()
      toast.success("Đã đặt làm tài khoản mặc định")
    } catch (err) {
      toast.error(
        err?.data?.message || "Không thể cập nhật tài khoản mặc định",
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?")) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteAccount(id).unwrap()
      toast.success("Đã xóa tài khoản ngân hàng")
    } catch (err) {
      toast.error(err?.data?.message || "Không thể xóa tài khoản ngân hàng")
      setIsDeleting(false)
    }
  }

  // Mask account number showing only last 4 digits
  const formatAccountNumber = (num) => {
    if (!num) return ""
    if (num.length <= 4) return num
    return `•••• ${num.slice(-4)}`
  }

  return (
    <FluentCard
      className={`relative transition-all duration-200 ${
        isDefault
          ? "border-[#990011]/30 bg-gradient-to-br from-red-50/40 via-white to-red-50/20 dark:border-red-500/30 dark:from-red-950/20 dark:via-neutral-900 dark:to-neutral-900"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
            <Building2 className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              {bankShortName || bankFullName || "Ngân hàng"}
            </h4>
            {bankFullName && bankShortName && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block max-w-[180px]">
                {bankFullName}
              </span>
            )}
          </div>
        </div>

        {isDefault && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100/80 px-2.5 py-1 text-xs font-medium text-[#990011] dark:bg-red-950/50 dark:text-red-300">
            <Star className="h-3.5 w-3.5 fill-[#990011] text-[#990011] dark:fill-red-400 dark:text-red-400" />
            Mặc định
          </span>
        )}
      </div>

      <div className="my-4 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Số tài khoản {bankBin ? `(BIN: ${bankBin})` : ""}
        </p>
        <p className="font-mono text-lg font-bold tracking-wider text-neutral-800 dark:text-neutral-200">
          {formatAccountNumber(accountNumber)}
        </p>
        {accountHolderName && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium uppercase text-neutral-600 dark:text-neutral-400">
              {accountHolderName}
            </p>
            {isVerified && (
              <span
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                title="Đã xác thực tên chủ tài khoản"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        {!isDefault ? (
          <button
            type="button"
            onClick={handleSetDefault}
            disabled={isSettingDefault}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#990011] hover:underline disabled:opacity-50 dark:text-red-400"
          >
            {isSettingDefault ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Đặt làm mặc định
          </button>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Tài khoản nhận thanh toán chính
          </span>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-neutral-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          title="Xóa tài khoản"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </FluentCard>
  )
}
