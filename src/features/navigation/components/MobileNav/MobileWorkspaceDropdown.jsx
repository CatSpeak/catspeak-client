import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronUp, ChevronDown, Video } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "../../hooks/useActiveLink"

const MobileWorkspaceDropdown = ({ navKey, onClose }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = useActiveLink(navKey)

  const isOnWorkspace = location.pathname.includes("/workspace")
  const [open, setOpen] = useState(isOnWorkspace)

  const subItems = [
    { key: "recordings", label: t?.recordings?.title || "Recordings", icon: Video, path: "/workspace/recordings" },
  ]

  const getActiveSubKey = () => {
    const path = location.pathname.split("/").pop()
    if (path === "workspace") return "recordings"
    return path
  }

  const activeSubKey = getActiveSubKey()

  const handleNavigateClick = () => {
    navigate("/workspace/recordings")
    onClose?.()
  }

  const handleSubItemClick = (item) => {
    navigate(item.path)
    onClose?.()
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center w-full gap-1">
        {/* Navigate button */}
        <button
          onClick={handleNavigateClick}
          className={`flex-grow h-10 text-sm px-3 flex items-center text-left rounded-[5px] transition-colors ${
            isActive || open
              ? "bg-[#F2F2F2] text-[#990011] hover:bg-[#E6E6E6]"
              : "hover:bg-[#F2F2F2]"
          }`}
        >
          <span>{t.nav?.[navKey] || "Workspace"}</span>
        </button>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setOpen((prev) => !prev)
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[#F2F2F2] ${
            isActive || open ? "text-[#990011]" : ""
          }`}
        >
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Collapse Container */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[120px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 mt-1">
          {subItems.map((item) => {
            const Icon = item.icon
            const isItemActive = isOnWorkspace && activeSubKey === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleSubItemClick(item)}
                className={`flex items-center w-full px-3 h-10 text-sm rounded-[5px] text-left transition-colors ${
                  isItemActive
                    ? "bg-[#F2F2F2] text-[#990011] hover:bg-[#E6E6E6]"
                    : "hover:bg-[#F2F2F2]"
                }`}
              >
                <div className="flex-shrink-0 min-w-[32px]">
                  <Icon size={18} className={isItemActive ? "text-[#990011]" : ""} />
                </div>
                <span className="flex-grow text-sm">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MobileWorkspaceDropdown
