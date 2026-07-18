import React from "react"
import { DesktopSidebar, MobileSidebar } from "@/features/navigation"

const MainSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
    </>
  )
}

export default MainSidebar
