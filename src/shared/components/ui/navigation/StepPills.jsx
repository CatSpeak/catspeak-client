import React, { memo } from "react"
import { Check } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"

/**
 * StepPills - Balanced & Connected Stepper.
 * Uses center-to-center connecting lines positioned behind the circles
 * ensuring seamless connectivity regardless of label width.
 *
 * @param {Array<{ id: number|string, label: string, disabled?: boolean }>} steps
 * @param {number|string} currentStep - The currently active step ID or index
 * @param {function} onStepClick - (stepId, stepIndex) => void
 * @param {number|string} maxStepReached - Highest reachable step
 * @param {string} className - Optional container styling
 */
const StepPills = memo(
  ({
    steps = [],
    currentStep = 1,
    onStepClick,
    maxStepReached,
    className = "",
  }) => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    const activeIndex = currentIndex >= 0 ? currentIndex : 0

    return (
      <nav
        aria-label="Progress"
        className={`overflow-x-auto scrollbar-none ${className}`}
      >
        <ol className="flex items-start">
          {steps.map((step, index) => {
            const isCompleted = index < activeIndex
            const isCurrent = index === activeIndex
            const isReachable =
              typeof maxStepReached === "number"
                ? index <= maxStepReached
                : true

            const isDisabled =
              step.disabled || (!isReachable && !isCompleted && !isCurrent)
            const isClickable = Boolean(onStepClick && !isDisabled)

            const buttonVariant =
              isCurrent || isCompleted ? "primary" : "secondary"

            return (
              <li
                key={step.id}
                className="relative flex flex-col items-center w-28 sm:w-32 shrink-0"
              >
                {/* Connecting Line touching the outer wrapper boundary (24px offset from centers) */}
                {index > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-6 h-0.5 -translate-y-1/2 bg-gray-200 -z-0 overflow-hidden"
                    style={{
                      right: "calc(50% + 24px)",
                      width: "calc(100% - 48px)",
                    }}
                  >
                    <div
                      className={`h-full bg-[#990011] transition-all duration-500 ease-out ${
                        isCompleted || isCurrent ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}

                {/* Circle Button */}
                <div className="relative z-10">
                  <IconButton
                    size="sm"
                    variant={buttonVariant}
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(step.id, index)}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? <Check /> : index + 1}
                  </IconButton>
                </div>

                {/* Subtext Label below circle */}
                <span className="text-sm mt-1.5 text-center leading-tight">
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)

StepPills.displayName = "StepPills"

export default StepPills
