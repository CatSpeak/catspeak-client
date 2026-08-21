import React, { memo } from "react"
import { Check, ChevronRight } from "lucide-react"
import StepPills from "./StepPills"

/**
 * StepWizardNav - Reusable Step Wizard Navigation component for multi-step forms.
 * Supports both "cards" (wide card wizard with descriptions) and "pills" (compact pill breadcrumb) styles.
 *
 * @param {Array<{ id: number|string, label: string, description?: string, icon?: React.ReactNode, disabled?: boolean }>} steps
 * @param {number|string} currentStep - The currently active step ID or index
 * @param {function} onStepClick - Optional click handler (stepId, stepIndex) => void
 * @param {number|string} maxStepReached - Highest step reachable to prevent skipping uncompleted steps
 * @param {"cards" | "pills"} variant - Visual style variant (default "cards")
 * @param {string} className - Optional container styling
 */
const StepWizardNav = memo(
  ({
    steps = [],
    currentStep = 1,
    onStepClick,
    maxStepReached = 1,
    variant = "cards",
    size = "md",
    className = "",
  }) => {
    if (variant === "pills") {
      return (
        <StepPills
          steps={steps}
          currentStep={currentStep}
          onStepClick={onStepClick}
          maxStepReached={maxStepReached}
          size={size}
          className={className}
        />
      )
    }

    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    return (
      <nav aria-label="Progress" className={`w-full ${className}`}>
        <ol className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = step.id === currentStep
            const isReachable =
              index <= currentIndex ||
              (typeof maxStepReached === "number" && index <= maxStepReached)
            const isDisabled = step.disabled || (!isReachable && !isCompleted && !isCurrent)
            const isClickable = Boolean(onStepClick && !isDisabled)

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <li className="flex-1 min-w-[140px] max-w-[280px]">
                  <button
                    type="button"
                    disabled={isDisabled || !isClickable}
                    onClick={() => isClickable && onStepClick(step.id, index)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                        : isCompleted
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200/80"
                        : "bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800 opacity-60"
                    } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {/* Number / Check Badge */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-cath-red-700 text-white"
                          : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : step.icon ? (
                        step.icon
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Step Label & Subtitle */}
                    <div className="truncate">
                      <p className="text-xs font-bold truncate leading-tight">
                        {step.label}
                      </p>
                      {step.description && (
                        <p
                          className={`text-[10px] truncate leading-normal ${
                            isCurrent
                              ? "text-slate-300 dark:text-zinc-600"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>

                {/* Divider Arrow between steps */}
                {index < steps.length - 1 && (
                  <li aria-hidden="true" className="shrink-0 text-slate-400 dark:text-zinc-600">
                    <ChevronRight className="w-4 h-4" />
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  },
)

StepWizardNav.displayName = "StepWizardNav"

export default StepWizardNav
