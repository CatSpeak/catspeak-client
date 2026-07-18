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
      className={`relative w-1/2 h-[42px] mx-auto flex py-6 items-center justify-center ${/(^|\s)rounded/.test(className) ? "" : "rounded-full"} text-sm font-bold uppercase tracking-widest text-white bg-[#990011] hover:bg-[#7a000d] hover:shadow-lg overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:bg-[#C0C0C0] disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default AuthButton
