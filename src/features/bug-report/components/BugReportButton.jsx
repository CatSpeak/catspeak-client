import React, { useState, useEffect } from "react"
import { Bug } from "lucide-react"
import BugReportModal from "./BugReportModal"
import { useLanguage } from "@/shared/context/LanguageContext"

export default function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [pathname, setPathname] = useState(
    typeof window !== "undefined" ? window.location.pathname : ""
  )
  const { t } = useLanguage()
  const lang = t.bugReport || {}

  useEffect(() => {
    const updatePath = () => {
      if (typeof window !== "undefined") {
        setPathname(window.location.pathname)
      }
    }
    window.addEventListener("popstate", updatePath)
    const interval = setInterval(updatePath, 400)
    return () => {
      window.removeEventListener("popstate", updatePath)
      clearInterval(interval)
    }
  }, [])

  const isInsideRoom = pathname.includes("/meet") || pathname.includes("/room")
  const positionClass = isInsideRoom
    ? "fixed top-1 right-4 z-40"
    : "fixed bottom-6 right-6 z-40"

  const tooltipText = lang.buttonTooltip || "Báo cáo sự cố"

  return (
    <>
      <div className={`${positionClass} transition-all duration-300`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all focus:outline-hidden cursor-pointer"
          aria-label={tooltipText}
        >
          <Bug className="w-5 h-5 transition-transform group-hover:rotate-12" />

          {/* Tooltip on hover */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 text-xs font-medium text-white bg-gray-900/95 dark:bg-gray-800/95 rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
            {tooltipText}
          </span>
        </button>
      </div>

      <BugReportModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
