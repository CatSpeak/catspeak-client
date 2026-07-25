import React, { createContext, useContext, useState } from "react"

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeDockSection, setActiveDockSection] = useState("community") // default section or selected dock key
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true) // controls if the secondary panel is open
  const [openDropdownKeys, setOpenDropdownKeys] = useState([])

  return (
    <SidebarContext.Provider value={{
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      activeDockSection,
      setActiveDockSection,
      isDesktopExpanded,
      setIsDesktopExpanded,
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

