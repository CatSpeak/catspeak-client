import React, { memo } from "react"
import { Check } from "lucide-react"

/**
 * StepProgress - Universal Connected Progress Track Stepper (Line + Nodes).
 * The #1 industry standard for linear creation, checkout, deposit, and onboarding workflows.
 *
 * @param {Array<{ id: number|string, label: string, description?: string, disabled?: boolean } | string>} steps
 * @param {number|string} currentStep - Current step ID or 1-based step index
 * @param {function} onStepClick - Optional click handler (stepId, stepIndex) => void
 * @param {number|string} maxStepReached - Highest reachable step index to prevent skipping ahead
 * @param {string} className - Optional container styling
 */
const StepProgress = memo(
  ({
    steps = [],
    currentStep = 1,
    onStepClick,
    maxStepReached,
    className = "",
  }) => {
    // Normalize steps to array of objects
    const normalizedSteps = steps.map((s, idx) =>
      typeof s === "string" ? { id: idx + 1, label: s } : s,
    )

    const totalSteps = normalizedSteps.length
    const currentIndex = normalizedSteps.findIndex((s) => s.id === currentStep)
    const activeIndex = currentIndex >= 0 ? currentIndex : 0

    const progressPercentage =
      totalSteps > 1
        ? (activeIndex / (totalSteps - 1)) * 100
        : 0

    return (
      <nav
        aria-label="Progress"
        className={`relative w-full max-w-2xl mx-auto py-3 px-4 ${className}`}
      >
        <div className="relative">
          {/* Background Track Line */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-6 right-6 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-zinc-800 z-0"
          >
            {/* Dynamic Progress Fill Line */}
            <div
              className="h-full bg-cath-red-700 transition-all duration-400 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Step Nodes & Labels */}
          <ol className="relative z-10 flex items-start justify-between w-full">
            {normalizedSteps.map((step, index) => {
              const isCompleted = index < activeIndex
              const isCurrent = index === activeIndex
              const isReachable =
                typeof maxStepReached === "number"
                  ? index <= maxStepReached
                  : true

              const isDisabled =
                step.disabled || (!isReachable && !isCompleted && !isCurrent)
              const isClickable = Boolean(onStepClick && !isDisabled)

              return (
                <li
                  key={step.id}
                  className="flex flex-col items-center flex-1 text-center"
                >
                  <button
                    type="button"
                    disabled={isDisabled || !isClickable}
                    onClick={() => isClickable && onStepClick(step.id, index)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`group flex flex-col items-center focus:outline-none transition-transform active:scale-95 ${
                      isClickable
                        ? "cursor-pointer"
                        : isDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-default"
                    }`}
                  >
                    {/* Circle Node with Halo */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 select-none ${
                        isCompleted
                          ? "bg-cath-red-700 text-white shadow-xs group-hover:bg-cath-red-800"
                          : isCurrent
                          ? "bg-white dark:bg-zinc-900 border-2 border-cath-red-700 text-cath-red-700 ring-4 ring-cath-red-100 dark:ring-cath-red-950/80 shadow-xs"
                          : "bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 group-hover:border-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Step Title Label */}
                    <div className="mt-2.5 px-1 max-w-[150px]">
                      <p
                        className={`text-xs sm:text-sm transition-colors leading-tight ${
                          isCurrent
                            ? "font-black text-slate-900 dark:text-zinc-100"
                            : isCompleted
                            ? "font-bold text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100"
                            : "font-semibold text-slate-400 dark:text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </p>

                      {/* Optional Subtitle / Description */}
                      {step.description && (
                        <p
                          className={`text-[11px] mt-0.5 transition-colors hidden sm:block ${
                            isCurrent
                              ? "text-cath-red-700 dark:text-cath-red-400 font-medium"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </nav>
    )
  },
)

StepProgress.displayName = "StepProgress"

export default StepProgress
