import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { NavLink } from "react-router-dom"

const DesktopNavDropdown = ({ icon: Icon, label, isExpanded, isOpen, onToggle, onMouseEnter, onMouseLeave, isActive, children }) => {

  return (
    <div className="flex flex-col">
      <button
        onClick={(e) => {
          onToggle()
        }}
        onMouseEnter={onMouseEnter}
        className={`relative flex items-center h-11 rounded-lg transition-all duration-300 group overflow-hidden w-full ${
          (isActive && !isExpanded) ? "bg-cath-red-700/10 text-cath-red-700 font-medium" : "text-gray-800 hover:bg-primary2 hover:text-gray-900"
        }`}
      >
        <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded ? "w-[64px]" : "w-[44px]"}`}>
          <Icon size={22} className="shrink-0" />
        </div>
        
        <span 
          className={`flex-1 text-left text-[15px] whitespace-nowrap transition-all duration-300 ${
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 w-0"
          }`}
        >
          {label}
        </span>
        
        <ChevronDown
          size={18}
          className={`shrink-0 transition-all duration-300 ${
            isOpen ? "rotate-180" : ""
          } ${isExpanded ? "opacity-100 mr-4" : "opacity-0 w-0"}`}
        />
      </button>
      <AnimatePresence>
        {isExpanded && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col relative mt-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DesktopNavDropdown
