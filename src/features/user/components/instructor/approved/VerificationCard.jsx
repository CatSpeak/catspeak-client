import React from "react"
import { CreditCard, ImageOff, Landmark, Mail, Phone } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { maskAccountNumber, pick } from "./utils"

const Row = ({ icon, label, value, actionLabel, onAction }) => (
  <div className="flex items-center gap-2.5 border-b border-[#E4E7EC] py-3 pl-1.5">
    <span className="flex shrink-0 items-center text-[#101828]">{icon}</span>
    <span className="w-[175px] shrink-0 text-xs font-medium text-[#101828]">
      {label}
    </span>
    <span className="min-w-0 flex-1 break-words text-xs text-[#101828]">
      {value || "—"}
    </span>
    <button
      type="button"
      onClick={onAction}
      className="inline-flex h-8 shrink-0 items-center rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5"
    >
      {actionLabel}
    </button>
  </div>
)

const IdImage = ({ label, url }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-1">
    <span className="text-[11px] text-[#101828]">{label}</span>
    <div className="flex h-[118px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#E2E2E2] bg-[#F2F4F7]">
      {url ? (
        <img
          src={url}
          alt={label}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageOff size={28} className="text-[#98A2B3]" />
      )}
    </div>
  </div>
)

const VerificationCard = ({
  profile,
  bankAccount,
  t,
  onChangeEmail,
  onChangePhone,
  onChangeBank,
  onUpdateIdCard,
}) => {
  const ins = t.profile?.instructor || {}

  const bankLabel = bankAccount
    ? [bankAccount.bankShortName, maskAccountNumber(bankAccount.accountNumber)]
        .filter(Boolean)
        .join(" ")
    : ""

  return (
    <FluentCard
      rounded="rounded-[10px]"
      padding="p-5"
      className="!justify-start gap-2"
    >
      <h2 className="text-base font-semibold text-[#101828]">
        {ins.approvedVerification || "Thông tin cần xác thực"}
      </h2>

      <div className="flex flex-col">
        <Row
          icon={<Mail size={20} />}
          label={ins.email || "Email"}
          value={pick(profile, "email", "Email")}
          actionLabel={ins.approvedChange || "Thay đổi"}
          onAction={onChangeEmail}
        />
        <Row
          icon={<Phone size={20} />}
          label={ins.phoneNumber || "Số điện thoại"}
          value={pick(profile, "phoneNumber", "PhoneNumber")}
          actionLabel={ins.approvedChange || "Thay đổi"}
          onAction={onChangePhone}
        />
        <Row
          icon={<Landmark size={20} />}
          label={ins.approvedBankAccount || "Tài khoản ngân hàng"}
          value={bankLabel}
          actionLabel={ins.approvedChange || "Thay đổi"}
          onAction={onChangeBank}
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[#101828]">
          {ins.idCard || "Căn cước công dân"}
        </span>
        <button
          type="button"
          onClick={onUpdateIdCard}
          className="inline-flex h-8 shrink-0 items-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5"
        >
          <CreditCard size={14} />
          <span>{ins.approvedUpdate || "Cập nhật"}</span>
        </button>
      </div>

      <div className="flex gap-5">
        <IdImage
          label={ins.idFront || "Mặt trước"}
          url={pick(profile, "idCardFrontUrl", "IdCardFrontUrl")}
        />
        <IdImage
          label={ins.idBack || "Mặt sau"}
          url={pick(profile, "idCardBackUrl", "IdCardBackUrl")}
        />
      </div>
    </FluentCard>
  )
}

export default VerificationCard
