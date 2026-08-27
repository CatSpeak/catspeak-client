import React from "react"
import { AlertTriangle } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"
import { PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"
import { checkSensitiveKeywords } from "../../../utils/voucherUtils"

export const BasicInfoSection = ({
  form,
  errors,
  onChange,
  onAutoGenerateCode,
  isGeneratingCode,
}) => {
  const { t } = useLanguage()
  const sensitiveWarning =
    checkSensitiveKeywords(form.title) ||
    checkSensitiveKeywords(form.description)

  return (
    <FluentCard className="space-y-4">
      <h4 className="font-bold">
        {t?.vouchers?.form?.basicInfo || "Thông tin cơ bản"}
      </h4>

      {/* Mã voucher */}
      <div className="space-y-2">
        <TextInput
          label={t?.vouchers?.form?.codeLabel || "Mã voucher"}
          required
          value={form.code ? form.code.replace(/^GV-/, "") : ""}
          onChange={(e) => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
            onChange("code", `GV-${raw}`)
          }}
          placeholder={t?.vouchers?.form?.codePlaceholder || "Nhập mã"}
          leftContent="GV-"
          error={errors.code}
        />
        <PillButton
          type="button"
          variant="primary"
          onClick={onAutoGenerateCode}
          loading={isGeneratingCode}
        >
          {t?.vouchers?.form?.autoGenerate || "Tạo ngẫu nhiên"}
        </PillButton>
      </div>

      {/* Tên chương trình */}
      <TextInput
        label={t?.vouchers?.form?.titleLabel || "Tên chương trình"}
        required
        value={form.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder={
          t?.vouchers?.form?.titlePlaceholder || "VD: Khuyến mãi tựu trường"
        }
        error={errors.title}
      />

      {/* Mô tả (nội bộ) */}
      <TextInput
        multiline
        label={t?.vouchers?.form?.descLabel || "Mô tả (nội bộ)"}
        value={form.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder={
          t?.vouchers?.form?.descPlaceholder || "Ghi chú nội bộ cho voucher này..."
        }
      />

      {sensitiveWarning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {t?.vouchers?.errors?.sensitiveKeyword ||
              "Nội dung chứa từ khóa nhạy cảm không hợp lệ"}
            : <strong>'{sensitiveWarning}'</strong> (BR-VC-GV-03)
          </span>
        </div>
      )}
    </FluentCard>
  )
}

export default BasicInfoSection
