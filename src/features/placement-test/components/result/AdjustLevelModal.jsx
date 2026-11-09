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
          const isDisabled = Boolean(option.disabled)
          const disabledNote =
            option.key === "down"
              ? copy.lowestNote || "HSK 1 là cấp thấp nhất"
              : copy.highestNote || "HSK 6 là cấp cao nhất"

          return (
            <label
              key={option.key}
              aria-disabled={isDisabled || undefined}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[10px] border-[1.5px] px-4 py-3 transition-colors",
                isDisabled
                  ? "cursor-not-allowed border-[#E2E8F0] dark:border-[#3F3F3F] bg-slate-100 dark:bg-[#202020] opacity-60"
                  : isSelected
                    ? "cursor-pointer border-cath-red-700 dark:border-red-400 bg-[#FEF2F2] dark:bg-rose-950/30"
                    : "cursor-pointer border-[#E2E8F0] dark:border-[#3F3F3F] bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-white dark:hover:bg-[#242424]",
              )}
            >
              <span className="flex flex-wrap items-center gap-1.5">
                <input
                  type="radio"
                  name="pt-adjust-level"
                  value={option.key}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && onSelect?.(option.key)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "text-[13.5px] font-bold leading-5",
                    isSelected ? "text-cath-red-700 dark:text-red-400" : "text-[#1E293B] dark:text-white",
                  )}
                >
                  HSK {option.level}
                </span>
                <span
                  className={cn(
                    "text-xs leading-[17px]",
                    isSelected
                      ? "font-semibold text-cath-red-700 dark:text-red-400"
                      : "font-normal text-slate-500 dark:text-neutral-400",
                  )}
                >
                  · {copy[OPTION_COPY_KEYS[option.key]]}
                </span>
                {isDisabled && (
                  <span className="w-full text-[11px] font-medium leading-4 text-slate-500 dark:text-neutral-400">
                    {disabledNote}
                  </span>
                )}
                {isRecommended && (
                  <span className="rounded-[4px] bg-[#FEE2E2] dark:bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-cath-red-700 dark:text-red-400">
                    {copy.recommended}
                  </span>
                )}
              </span>

              {isSelected && (
                <span
                  aria-hidden="true"
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-cath-red-700 dark:border-red-400"
                >
                  <span className="h-2 w-2 rounded-full bg-cath-red-700 dark:bg-red-400" />
                </span>
              )}
            </label>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#FEF3C7] dark:border-amber-900/40 bg-[#FFFBEB] dark:bg-amber-950/30 px-3 py-2.5">
        <AlertTriangle
          size={15}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[#B45309] dark:text-amber-400"
        />
        <p className="text-[11.5px] leading-[16.7px] text-[#92400E] dark:text-amber-300">
          {copy.warning}
        </p>
      </div>
    </Modal>
  )
}

export default AdjustLevelModal
