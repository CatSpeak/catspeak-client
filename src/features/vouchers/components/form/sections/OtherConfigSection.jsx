import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput, Checkbox } from "@/shared/components/ui/inputs"

export const OtherConfigSection = ({ form, errors = {}, onChange }) => {
  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Cấu hình khác</h4>

      <div
        onClick={() => onChange("isOnlyNewUser", !form.isOnlyNewUser)}
        className="group flex items-center gap-2 cursor-pointer select-none"
      >
        <Checkbox
          withWrapper
          checked={Boolean(form.isOnlyNewUser)}
          onChange={() => {}}
        />
        <span>Chỉ dành cho người mới</span>
      </div>

      <TextInput
        type="number"
        label="Số người học tối thiểu"
        required
        value={form.minLearners || 1}
        onChange={(e) => onChange("minLearners", e.target.value)}
        error={errors?.minLearners}
        placeholder="1"
      />
    </FluentCard>
  )
}

export default OtherConfigSection
