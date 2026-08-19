import React from "react"
import { AlertTriangle } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"
import { PillButton } from "@/shared/components/ui/buttons"
import { checkSensitiveKeywords } from "../../../utils/voucherUtils"

export const BasicInfoSection = ({
  form,
  errors,
  onChange,
  onAutoGenerateCode,
  isGeneratingCode,
}) => {
  const sensitiveWarning =
    checkSensitiveKeywords(form.title) ||
    checkSensitiveKeywords(form.description)

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">Thông tin cơ bản</h4>

      {/* Mã voucher */}
      <div className="space-y-2">
        <TextInput
          label="Mã voucher"
          required
          value={form.code ? form.code.replace(/^GV-/, "") : ""}
          onChange={(e) => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
            onChange("code", `GV-${raw}`)
          }}
          placeholder="Nhập mã"
          leftContent="GV-"
          error={errors.code}
        />
        <PillButton
          type="button"
          variant="primary"
          onClick={onAutoGenerateCode}
          loading={isGeneratingCode}
        >
          Tạo ngẫu nhiên
        </PillButton>
      </div>

      {/* Tên chương trình */}
      <TextInput
        label="Tên chương trình"
        required
        value={form.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="VD: Khuyến mãi tựu trường"
        error={errors.title}
      />

      {/* Mô tả (nội bộ) */}
      <TextInput
        multiline
        label="Mô tả (nội bộ)"
        value={form.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Ghi chú về đợt khuyến mãi này..."
      />

      {sensitiveWarning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Chặn từ khóa nhạy cảm: <strong>'{sensitiveWarning}'</strong>{" "}
            (BR-VC-GV-03)
          </span>
        </div>
      )}
    </FluentCard>
  )
}

export default BasicInfoSection
