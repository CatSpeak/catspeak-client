import React from "react"
import { Check } from "lucide-react"

const StepProgress = ({
  currentStep = 1,
  totalSteps = 2,
  steps = [],
  className = "",
}) => {
  return (
    <div className={`relative flex flex-col w-full py-2 ${className}`}>
      {/* Grouped Steps Container */}
      <div className="relative flex items-end justify-between w-full">
        {/* Continuous Horizontal Line aligned precisely with dot centers */}
        <div className="absolute left-6 right-6 bottom-[9px] h-[2px] bg-gray-200 dark:bg-gray-700 z-0">
          <div
            className="h-full bg-cath-red-700 transition-all duration-300 ease-in-out"
            style={{
              width:
                totalSteps > 1
                  ? `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
                  : "0%",
            }}
          />
        </div>

        {/* Grouped Step Divs (Text Label + Dot together in one vertical column) */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const stepTitle = steps[index] || `Step ${stepNumber}`

          return (
            <div
              key={stepNumber}
              className="relative z-10 flex flex-col items-center gap-2.5 px-2"
            >
              {/* Title Label */}
              <span
                className={`text-xs transition-colors duration-200 whitespace-nowrap ${
                  isCurrent
                    ? "font-bold text-gray-900 dark:text-gray-100"
                    : isCompleted
                      ? "font-semibold text-cath-red-700 dark:text-red-400"
                      : "font-medium text-gray-400"
                }`}
              >
                {stepTitle}
              </span>

              {/* Dot Node */}
              <div className="flex items-center justify-center bg-white dark:bg-gray-900 rounded-full p-0.5">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-cath-red-700 flex items-center justify-center text-white shadow-sm transition-all duration-300">
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-4 border-cath-red-700 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 transition-all duration-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepProgress
