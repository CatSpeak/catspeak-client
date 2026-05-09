import React from "react"
import { ShieldCheck } from "lucide-react"

const InstructorSubmitSection = ({
  agreed,
  onAgreeChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  submitLabel,
  updatingLabel,
  t,
}) => {
  const ins = t.profile?.instructor || {}
  const buttonText = isSubmitting
    ? (updatingLabel || ins.submitting)
    : (submitLabel || ins.submit)

  const isDisabled = !agreed || isSubmitting || disabled

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-5">
        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreeChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#990011] rounded border-gray-300 flex-shrink-0"
          />
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition">
              {ins.certify}
            </span>
          </div>
        </label>

        {/* Submit Button */}
        <div className="flex justify-end mt-5">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#990011] text-white text-sm font-semibold rounded-lg hover:bg-[#7a000d] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-sm hover:shadow"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstructorSubmitSection
