import React from "react"
import LogoIcon from "@/shared/assets/icons/logo/icon.svg"

const EmptyRoomState = ({ message, height = "h-[320px]" }) => {
  return (
    <div
      className={`flex ${height} w-full flex-col items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F]`}
    >
      <img 
        src={LogoIcon} 
        alt="Empty State" 
        className="h-16 w-16 rounded-full bg-white dark:bg-[#272727] shadow-sm mb-4 border border-border dark:border-[#3F3F3F] p-3 object-contain" 
      />
      <p className="px-8 m-0 text-center text-sm font-medium text-[#7A7574] dark:text-[#AAAAAA] leading-relaxed max-w-sm">
        {message}
      </p>
    </div>
  )
}

export default EmptyRoomState
