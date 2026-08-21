import React, { useState } from "react"
import { Plus, CreditCard, AlertCircle, UserCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import FluentCard from "@/shared/components/ui/FluentCard"
import Banner from "@/shared/components/ui/Banner"
import { EmptyState } from "@/shared/components/ui/indicators"
import BankAccountCard from "./BankAccountCard"
import BankAccountCardSkeleton from "./BankAccountCardSkeleton"
import AddBankAccountModal from "./AddBankAccountModal"
import { useGetInstructorBankAccountsQuery } from "../api/instructorBankAccountsApi"

export default function BankAccountList() {
  const { t } = useLanguage()
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
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold">
          {t?.bankAccounts?.title || "Tài khoản ngân hàng nhận thanh toán"}
        </h3>

        <PillButton
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          startIcon={<Plus className="h-4 w-4" />}
        >
          {t?.bankAccounts?.addButton || "Thêm tài khoản"}
        </PillButton>
      </div>

      {/* Content State */}
      {isLoading ? (
        <BankAccountCardSkeleton />
      ) : isError ? (
        error?.status === 422 &&
        error?.data?.message === "TEACHER_PROFILE_REQUIRED" ? (
          <FluentCard>
            <EmptyState
              icon={UserCheck}
              title={
                t?.bankAccounts?.instructorProfileRequiredTitle ||
                "Yêu cầu Hồ sơ Giảng viên"
              }
              description={
                t?.bankAccounts?.instructorProfileRequiredDesc ||
                "Bạn cần có hồ sơ Giảng viên được phê duyệt để liên kết tài khoản ngân hàng và nhận thù lao giảng dạy."
              }
              action={
                <a href="/setting/instructor" className="mt-4">
                  <PillButton variant="primary">
                    {t?.bankAccounts?.registerInstructorBtn ||
                      "Đăng ký Giảng viên ngay"}
                  </PillButton>
                </a>
              }
            />
          </FluentCard>
        ) : (
          <Banner
            variant="danger"
            title={
              t?.bankAccounts?.errorLoadList ||
              "Không thể tải danh sách tài khoản ngân hàng"
            }
            action={{
              label: t?.bankAccounts?.retryBtn || "Thử lại",
              onClick: () => refetch(),
            }}
          >
            {error?.data?.message ||
              (error?.status ? `HTTP Status: ${error.status}` : null)}
          </Banner>
        )
      ) : accounts.length === 0 ? (
        <FluentCard>
          <EmptyState
            icon={CreditCard}
            title={
              t?.bankAccounts?.emptyTitle || "Chưa có tài khoản ngân hàng nào"
            }
            description={
              t?.bankAccounts?.emptyDescription ||
              "Thêm tài khoản ngân hàng để nhận thanh toán trực tiếp từ hệ thống."
            }
          />
        </FluentCard>
      ) : (
        /* Stable Grid Layout (Stripe/Wise Industry Standard: No Position Shift) */
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
