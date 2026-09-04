import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput, Checkbox } from "@/shared/components/ui/inputs"
import { useLanguage } from "@/shared/context/LanguageContext"

export const OtherConfigSection = ({ form, errors = {}, onChange, onBlur }) => {
  const { t } = useLanguage()

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {t?.vouchers?.form?.otherConfig || "Cấu hình khác"}
      </h4>

      <div
        onClick={() => onChange("isOnlyNewUser", !form.isOnlyNewUser)}
        className="group flex items-center gap-2 cursor-pointer select-none"
      >
        <Checkbox checked={Boolean(form.isOnlyNewUser)} onChange={() => {}} />
        <span className="text-sm">
          {t?.vouchers?.form?.onlyNewUser || "Chỉ áp dụng cho học viên mới"}
        </span>
      </div>

      <TextInput
        type="number"
        label={t?.vouchers?.form?.minLearnersLabel || "Số người học tối thiểu"}
        required
        min={1}
        value={form.minLearners ?? ""}
        onChange={(e) => onChange("minLearners", e.target.value)}
        onBlur={() => onBlur?.("minLearners")}
        error={errors?.minLearners}
        placeholder="1"
      />
    </FluentCard>
  )
}

export default OtherConfigSection
