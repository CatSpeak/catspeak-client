import React from "react"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"
import GuestSettingsDropdown from "./GuestSettingsDropdown"

/**
 * GuestSettingsControls
 * - On >= sm screens: shows LanguageSwitcher, ThemeToggle, and GuestSettingsDropdown (with desktop MenuList)
 * - On < sm screens: shows only the GuestSettingsDropdown (which renders fullscreen mobile portal)
 */
const GuestSettingsControls = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* On sm and above: also display individual 1-click LanguageSwitcher and ThemeToggle */}
      <div className="hidden sm:flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* GuestSettingsDropdown is visible on all screen sizes (desktop popover on >= sm, fullscreen portal on < sm) */}
      <GuestSettingsDropdown />
    </div>
  )
}

export default GuestSettingsControls
