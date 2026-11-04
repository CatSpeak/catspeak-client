import React from "react"

/**
 * Reusable Label component for form controls, inputs, and dialogs.
 * Baseline style: text-xs text-secondary dark:text-[#AAAAAA]
 *
 * @param {React.ReactNode} children - Label text or content
 * @param {string} [htmlFor] - Associated input id
 * @param {boolean} [required] - Shows red required indicator asterisk
 * @param {string} [className] - Additional custom classes
 * @param {React.ElementType} [as="label"] - Underlying HTML element tag
 */
const Label = ({
  children,
  htmlFor,
  required = false,
  className = "",
  as: Component = "label",
  ...props
}) => {
  return (
    <Component
      {...(Component === "label" && htmlFor ? { htmlFor } : {})}
      className={`text-xs text-secondary dark:text-[#AAAAAA] ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="text-cath-red-600 dark:text-cath-red-400 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </Component>
  )
}

export default Label

