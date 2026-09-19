import { AlertTriangle, SlidersHorizontal } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { cn } from "@/lib/utils"
import { formatTemplate } from "../../utils/format"

const OPTION_COPY_KEYS = {
  down: "optionDown",
  keep: "optionKeep",
  up: "optionUp",
}

const AdjustLevelModal = ({
  open,
  onClose,
  copy = {},
  band,
  aiTierLabel,
  options = [],
  selected = "keep",
  onSelect,
  confirming = false,
  onConfirm,
}) => {
  const selectedOption =
    options.find((option) => option.key === selected) || options[0]

  const header = (
    <div className="flex items-center gap-3.5">
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#FFF7ED] text-[#EA580C] ring-1 ring-[#FFEDD5]">
        <SlidersHorizontal size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-bold leading-[27px] text-[#09090B]">
          {copy.title}
        </h2>
        <p className="text-[12.5px] font-semibold leading-[18px] text-[#2563EB]">
          {formatTemplate(copy.currentSub, { band, tier: aiTierLabel })}
        </p>
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={header}
      className="md:max-w-[520px]"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <PillButton
            variant="secondary"
            roundedClass="rounded-[10px]"
            className="sm:w-auto"
            onClick={onClose}
          >
            {formatTemplate(copy.cancelCta, { band })}
          </PillButton>
          <PillButton
            roundedClass="rounded-[10px]"
            className="sm:w-auto"
            loading={confirming}
            onClick={() => onConfirm?.(selectedOption?.level)}
          >
            {copy.confirmCta}
          </PillButton>
        </div>
      }
    >
      <p className="text-[12.5px] leading-[18px] text-slate-600">
        {copy.intro}
      </p>

      <div
        role="radiogroup"
        aria-label={copy.title}
        className="mt-4 flex flex-col gap-2.5"
      >
        {options.map((option) => {
          const isSelected = option.key === selected
          const isRecommended = option.key === "keep"

          return (
            <label
              key={option.key}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border-[1.5px] px-4 py-3 transition-colors",
                isSelected
                  ? "border-cath-red-700 bg-[#FEF2F2]"
                  : "border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white",
              )}
            >
              <span className="flex flex-wrap items-center gap-1.5">
                <input
                  type="radio"
                  name="pt-adjust-level"
                  value={option.key}
                  checked={isSelected}
                  onChange={() => onSelect?.(option.key)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "text-[13.5px] font-bold leading-5",
                    isSelected ? "text-cath-red-700" : "text-[#1E293B]",
                  )}
                >
                  HSK {option.level}
                </span>
                <span
                  className={cn(
                    "text-xs leading-[17px]",
                    isSelected
                      ? "font-semibold text-cath-red-700"
                      : "font-normal text-slate-500",
                  )}
                >
                  · {copy[OPTION_COPY_KEYS[option.key]]}
                </span>
                {isRecommended && (
                  <span className="rounded-[4px] bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] font-bold leading-4 text-cath-red-700">
                    {copy.recommended}
                  </span>
                )}
              </span>

              {isSelected && (
                <span
                  aria-hidden="true"
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-cath-red-700"
                >
                  <span className="h-2 w-2 rounded-full bg-cath-red-700" />
                </span>
              )}
            </label>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2.5">
        <AlertTriangle
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[#B45309]"
        />
        <p className="text-[11.5px] leading-[16.7px] text-[#92400E]">
          {copy.warning}
        </p>
      </div>
    </Modal>
  )
}

export default AdjustLevelModal
