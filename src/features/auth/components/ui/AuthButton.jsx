import React from "react"

const AuthButton = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full h-10 flex items-center justify-center ${/(^|\s)rounded/.test(className) ? "" : "rounded-full"} text-sm font-bold uppercase tracking-widest text-white bg-[linear-gradient(135deg,#910B09,#F5A51B)] hover:shadow-lg overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default AuthButton
