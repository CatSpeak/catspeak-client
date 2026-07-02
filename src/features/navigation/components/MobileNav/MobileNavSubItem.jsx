import React from "react"
import { NavLink } from "react-router-dom"

const MobileNavSubItem = ({ to, label, isLast, setIsMobileOpen }) => {
  const getSubLinkClasses = ({ isActive }) =>
    `relative flex items-center w-full h-10 rounded-lg transition-colors z-10 pl-4 pr-4 ${
      isActive
        ? "text-cath-red-700 font-medium bg-cath-red-700/10" 
        : "text-gray-800 active:bg-primary2"
    }`

  return (
    <div className="relative flex items-center ml-[28px] mr-4 h-10">
      {!isLast ? (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cath-red-700/20" />
          <div className="absolute left-0 top-[19px] w-[16px] h-[2px] bg-cath-red-700/20" />
        </>
      ) : (
        <div className="absolute left-0 top-0 w-[16px] h-[20px] border-l-[2px] border-b-[2px] border-cath-red-700/20 rounded-bl-[8px]" />
      )}
      
      <div className="flex-1 ml-[22px]">
        <NavLink to={to} className={getSubLinkClasses} onClick={() => setIsMobileOpen(false)}>
          <span className="text-[14px]">{label}</span>
        </NavLink>
      </div>
    </div>
  )
}

export default MobileNavSubItem
