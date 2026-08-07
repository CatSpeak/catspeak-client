import React, { useState } from "react"
import { Plus, CreditCard, Loader2, AlertCircle } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import FluentCard from "@/shared/components/ui/FluentCard"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import BankAccountCard from "./BankAccountCard"
import AddBankAccountModal from "./AddBankAccountModal"
import { useGetInstructorBankAccountsQuery } from "../api/instructorBankAccountsApi"

export default function BankAccountList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInstructorBankAccountsQuery()

  if (isError) {
    console.log("[BankAccounts API Error Object]:", error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Tài khoản ngân hàng nhận thanh toán
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Quản lý danh sách tài khoản ngân hàng liên kết để nhận thù lao giảng
            dạy.
          </p>
        </div>

        <PillButton
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          startIcon={<Plus className="h-4 w-4" />}
        >
          Thêm tài khoản
        </PillButton>
      </div>

      {/* Content State */}
      {isLoading ? (
        <FluentCard className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#990011] dark:text-red-400 mb-2" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Đang tải tài khoản ngân hàng...
          </p>
        </FluentCard>
      ) : isError ? (
        error?.status === 422 &&
        error?.data?.message === "TEACHER_PROFILE_REQUIRED" ? (
          <FluentCard className="flex flex-col items-center justify-center text-center py-8 border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white">
              Yêu cầu Hồ sơ Giảng viên
            </h4>
            <p className="mt-1.5 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
              Bạn cần có hồ sơ Giảng viên được phê duyệt để liên kết tài khoản
              ngân hàng và nhận thù lao giảng dạy.
            </p>
            <a
              href="/setting/instructor"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#990011] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#80000e] transition-colors"
            >
              Đăng ký Giảng viên ngay
            </a>
          </FluentCard>
        ) : (
          <FluentCard className="flex flex-col items-center justify-center py-12 border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              {error?.data?.message ||
                "Không thể tải danh sách tài khoản ngân hàng"}
            </p>
            <p className="mt-1 text-xs text-neutral-500 font-mono">
              HTTP Status: {error?.status}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold text-[#990011] underline hover:text-[#80000e] dark:text-red-400"
            >
              Thử lại
            </button>
          </FluentCard>
        )
      ) : accounts.length === 0 ? (
        <FluentCard className="border-dashed border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40">
          <EmptyState
            icon={CreditCard}
            iconClassName="w-12 h-12 mb-3 text-neutral-400 dark:text-neutral-500 stroke-[1.5]"
            title="Chưa có tài khoản ngân hàng nào"
            description="Thêm tài khoản ngân hàng để nhận thanh toán trực tiếp từ hệ thống."
            action={
              <PillButton
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                startIcon={<Plus className="h-4 w-4" />}
                className="mt-4"
              >
                Thêm tài khoản ngay
              </PillButton>
            }
          />
        </FluentCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <BankAccountCard key={acc.id} account={acc} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddBankAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
