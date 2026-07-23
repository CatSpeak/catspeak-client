import React from "react"

const StepWizard = ({
  children,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {children}
    </div>
  )
}

export default StepWizard
