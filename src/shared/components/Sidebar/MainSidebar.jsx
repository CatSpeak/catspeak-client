import React from "react"
import { DesktopSidebar, MobileSidebar } from "@/features/navigation"

const MainSidebar = ({ isMobileOpen, setIsMobileOpen, isExpanded, setIsExpanded }) => {
  return (
    <>
      <DesktopSidebar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded} 
      />
      <MobileSidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
    </>
  )
}

export default MainSidebar
