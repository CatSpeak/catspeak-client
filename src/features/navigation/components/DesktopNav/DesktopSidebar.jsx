import React from "react"
import { Link } from "react-router-dom"
import { PanelRightOpen } from "lucide-react"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"
import DesktopNavItems from "./DesktopNavItems"

const DesktopSidebar = ({ isExpanded, setIsExpanded }) => {
  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-100 rounded-tr-2xl flex-col transition-all duration-300 z-50 ${
        isExpanded ? "w-[280px]" : "w-[80px]"
      }`}
    >
      {/* Header/Logo section */}
      <div className="flex items-center justify-between h-[64px] mx-2  border-gray-100 shrink-0">
        <div className="flex items-center w-full h-full relative overflow-hidden">
          <Link to="/" className="flex items-center h-full w-full">
            <div className="flex items-center justify-center shrink-0 w-[64px]">
              <img src={IconLogo} alt="Cat Speak" className="h-7 w-7 shrink-0" />
            </div>
            <img 
              src={MainLogo} 
              alt="Cat Speak" 
              className={`h-6 w-auto shrink-0 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0'}`} 
            />
          </Link>
          
          <button
            onClick={() => setIsExpanded(false)}
            className={`absolute right-0 p-1.5 rounded-md text-gray-800 hover:bg-gray-100 transition-all duration-300 ${
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none w-0'
            }`}
          >
            <PanelRightOpen size={20} />
          </button>

          {/* Invisible click overlay when collapsed to expand the sidebar */}
          {!isExpanded && (
            <div 
              className="absolute inset-0 z-10 cursor-pointer" 
              onClick={() => setIsExpanded(true)} 
            />
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <DesktopNavItems isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </aside>
  )
}

export default DesktopSidebar
