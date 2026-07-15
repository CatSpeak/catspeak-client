import React from "react";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import { Checkbox } from "@/shared/components/ui/inputs";
import FluentCard from "@/shared/components/ui/FluentCard";

const InstructorSubmitSection = ({
  agreed,
  onAgreeChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  submitLabel,
  buttonText,
  t,
  errors = {},
}) => {
  const ins = t.profile?.instructor || {};
  const isDisabled = isSubmitting || disabled;

  return (
    <FluentCard className="sm:flex-row items-center justify-between gap-6 mt-10 mb-32">
      {/* Terms */}
      <label id="field-agreed" className="flex items-start gap-3 cursor-pointer group flex-1">
        <Checkbox
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span className={`text-[13px] leading-relaxed transition-colors ${errors.agreed ? "text-red-500" : "text-gray-500 group-hover:text-gray-800"}`}>
          {ins.certify || "Tôi xác nhận rằng thông tin cung cấp là chính xác và đồng ý tuân thủ các quy định của nền tảng."}
        </span>
      </label>

      {/* Submit Button */}
      <PillButton
        onClick={onSubmit}
        disabled={isDisabled}
        loading={isSubmitting}
        loadingText={ins.submitting || "Đang gửi..."}
        className="min-w-[180px] w-full sm:w-auto h-12 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 shrink-0 [&>div]:h-full [&>div]:text-base [&>div]:px-8"
      >
        {buttonText || submitLabel || ins.submit}
      </PillButton>
    </FluentCard>
  );
};

export default InstructorSubmitSection;
