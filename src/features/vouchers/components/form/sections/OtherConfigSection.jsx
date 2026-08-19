import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"

export const OtherConfigSection = ({ form, onChange }) => {
  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Cấu hình khác</h4>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(form.isOnlyNewUser)}
          onChange={(e) => onChange("isOnlyNewUser", e.target.checked)}
          className="w-4 h-4 rounded text-cath-red-700 focus:ring-cath-red-500 cursor-pointer"
        />
        <span className="text-xs text-slate-700 font-medium">
          Chỉ dành cho người mới
        </span>
      </label>

      <TextInput
        type="number"
        label="Số người học tối thiểu"
        value={form.minLearners || 1}
        onChange={(e) => onChange("minLearners", e.target.value)}
        placeholder="1"
        containerClassName="sm:w-48"
      />
    </FluentCard>
  )
}

export default OtherConfigSection
