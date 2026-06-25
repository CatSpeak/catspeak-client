import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { NavLink } from "react-router-dom"

const MobileNavDropdown = ({ icon: Icon, label, isOpen, onToggle, isActive, children }) => {

  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className={`relative flex items-center h-12 rounded-xl transition-colors group px-4 justify-between ${
          isActive ? "bg-cath-red-700/10 text-cath-red-700 font-medium" : "hover:bg-primary2 text-gray-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className="shrink-0" />
          <span className="text-[16px]">{label}</span>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
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

export default MobileNavDropdown
