import React from "react"
import { Link } from "react-router-dom"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"
import { X } from "lucide-react"
import MobileNavItems from "./MobileNavItems"

const MobileSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[280px] bg-white border-r rounded-r-3xl shadow-[4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 z-50 lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo section */}
        <div className="flex items-center justify-between h-[64px] mx-2 shrink-0">
          <div className="flex items-center w-full h-full relative overflow-hidden">
            <Link 
              to="/" 
              className="flex items-center h-full flex-1"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="flex items-center justify-center shrink-0 w-[64px]">
                <img src={IconLogo} alt="Cat Speak" className="h-7 w-7 shrink-0" />
              </div>
              <img src={MainLogo} alt="Cat Speak" className="h-6 w-auto shrink-0" />
            </Link>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="p-2 mr-2 text-gray-500 hover:bg-[#F2F2F2] rounded-full transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <MobileNavItems isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </aside>
    </>
  )
}

export default MobileSidebar
