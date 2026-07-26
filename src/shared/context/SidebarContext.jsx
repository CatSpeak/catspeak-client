import React, { createContext, useContext, useState, useCallback } from "react"

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [activeDockSection, setActiveDockSection] = useState("community") // default section or selected dock key
  const [isDesktopExpanded, setIsDesktopExpandedState] = useState(() => {
    const saved = localStorage.getItem("isDesktopExpanded")
    return saved !== null ? saved === "true" : true
  })
  const [lastSublinks, setLastSublinksState] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarLastSublinks")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [openDropdownKeys, setOpenDropdownKeys] = useState([])

  const setIsDesktopExpanded = useCallback((value) => {
    setIsDesktopExpandedState((prev) => {
      const next = typeof value === "function" ? value(prev) : value
      localStorage.setItem("isDesktopExpanded", String(next))
      return next
    })
  }, [])

  const setLastSublink = useCallback((sectionKey, path) => {
    if (!sectionKey || !path) return
    setLastSublinksState((prev) => {
      if (prev[sectionKey] === path) return prev
      const updated = { ...prev, [sectionKey]: path }
      localStorage.setItem("sidebarLastSublinks", JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <SidebarContext.Provider value={{
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      activeDockSection,
      setActiveDockSection,
      isDesktopExpanded,
      setIsDesktopExpanded,
      lastSublinks,
      setLastSublink,
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

