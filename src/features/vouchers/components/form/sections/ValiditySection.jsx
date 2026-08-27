import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput, Checkbox } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"

export const ValiditySection = ({ form, errors, onChange }) => {
  const { t } = useLanguage()

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {t?.vouchers?.form?.validity || "Thời gian hiệu lực"}
      </h4>

      {/* Ngày bắt đầu */}
      <TextInput
        type="date"
        label={t?.vouchers?.form?.validFromLabel || "Bắt đầu"}
        required
        value={form.validFrom || ""}
        onChange={(e) => onChange("validFrom", e.target.value)}
        error={errors?.validFrom}
      />

      {/* Ngày kết thúc */}
      <TextInput
        type="date"
        label={t?.vouchers?.form?.validToLabel || "Kết thúc"}
        required={!form.isNeverExpired}
        disabled={Boolean(form.isNeverExpired)}
        value={form.isNeverExpired ? "" : form.validTo || ""}
        onChange={(e) => onChange("validTo", e.target.value)}
        error={!form.isNeverExpired ? errors?.validTo : undefined}
      />

      {/* Checkbox Không giới hạn */}
      <div
        onClick={() => onChange("isNeverExpired", !form.isNeverExpired)}
        className="group flex items-center gap-2 cursor-pointer select-none"
      >
        <Checkbox checked={Boolean(form.isNeverExpired)} onChange={() => {}} />
        <span className="text-sm">
          {t?.vouchers?.form?.neverExpired || "Không giới hạn thời gian"}
        </span>
      </div>
    </FluentCard>
  )
}

export default ValiditySection
