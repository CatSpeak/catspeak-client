import React, { useState } from "react";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import { Checkbox } from "@/shared/components/ui/inputs";
import FluentCard from "@/shared/components/ui/FluentCard";
import PolicyModal from "@/features/auth/components/popups/PolicyModal";

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
  const [selectedPolicy, setSelectedPolicy] = useState(null);


  return (
    <>
      <FluentCard className="sm:flex-row items-center justify-between gap-6 mb-32">
        {/* Terms */}
        <label id="field-agreed" className={`flex items-start gap-3 group flex-1 ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
          <Checkbox
            checked={agreed}
            onChange={(e) => !isDisabled && onAgreeChange(e.target.checked)}
            disabled={isDisabled}
            className="mt-0.5 shrink-0"
          />
          <span className={`text-[13px] leading-relaxed transition-colors ${errors.agreed ? "text-red-500" : "text-gray-500 group-hover:text-gray-800"}`}>
            Tôi xác nhận rằng thông tin cung cấp là chính xác.{" "}
            Tôi đồng ý tuân thủ{" "}
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPolicy("Quy định nền tảng");
              }} 
              className="text-[#8f0d15] hover:underline font-medium"
            >
              Quy định nền tảng
            </button>
            .
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
      
      <PolicyModal 
        open={!!selectedPolicy} 
        onClose={() => setSelectedPolicy(null)} 
        title={selectedPolicy} 
      />
    </>
  );
};

export default InstructorSubmitSection;
