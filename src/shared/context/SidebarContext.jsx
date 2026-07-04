import React, { createContext, useContext, useState } from "react"

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isDesktopSidebarDocked, setIsDesktopSidebarDocked] = useState(false)
  const [openDropdownKeys, setOpenDropdownKeys] = useState([])

  return (
    <SidebarContext.Provider value={{
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      isDesktopSidebarDocked,
      setIsDesktopSidebarDocked,
      openDropdownKeys,
      setOpenDropdownKeys
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
