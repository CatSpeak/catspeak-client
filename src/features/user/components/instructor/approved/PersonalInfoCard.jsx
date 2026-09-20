import React from "react"
import { Globe, MapPin, Pencil, User } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { pick } from "./utils"

const Row = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 border-b border-[#E4E7EC] py-3 pl-1.5 last:border-b-0">
    <span className="flex shrink-0 items-center text-[#101828]">{icon}</span>
    <span className="w-[150px] shrink-0 text-xs font-medium text-[#101828]">
      {label}
    </span>
    <span className="min-w-0 flex-1 break-words text-xs text-[#101828]">
      {value || "—"}
    </span>
  </div>
)

const PersonalInfoCard = ({ profile, t, onEdit }) => {
  const ins = t.profile?.instructor || {}

  return (
    <FluentCard
      rounded="rounded-[10px]"
      padding="p-5"
      className="!justify-start gap-2.5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#101828]">
          {ins.approvedPersonalInfo || "Thông tin cá nhân"}
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[7px] border border-[#990011] px-3 text-xs font-semibold text-[#990011] transition-colors hover:bg-[#990011]/5"
        >
          <Pencil size={15} />
          <span>{ins.edit || "Chỉnh sửa"}</span>
        </button>
      </div>

      <div className="flex flex-col">
        <Row
          icon={<User size={20} />}
          label={ins.fullName || "Họ và tên"}
          value={pick(profile, "fullName", "FullName")}
        />
        <Row
          icon={<Globe size={20} />}
          label={ins.nationality || "Quốc tịch"}
          value={pick(profile, "nationality", "Nationality")}
        />
        <Row
          icon={<MapPin size={20} />}
          label={ins.address || "Địa chỉ"}
          value={pick(profile, "address", "Address")}
        />
      </div>

      <div className="text-[13px] font-semibold text-[#101828]">
        {ins.introduceYourself || "Giới thiệu bản thân"}
      </div>
      <div className="min-h-[132px] whitespace-pre-wrap rounded-[7px] border border-[#D0D5DD] p-3.5 text-xs text-[#101828]">
        {pick(profile, "introduction", "Introduction") || "—"}
      </div>
    </FluentCard>
  )
}

export default PersonalInfoCard
