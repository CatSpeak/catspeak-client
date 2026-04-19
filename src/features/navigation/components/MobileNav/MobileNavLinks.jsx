import React from "react"
import { navLinks } from "../../config/navigation"
import MobileCommunityDropdown from "./MobileCommunityDropdown"
import MobileCatSpeakDropdown from "./MobileCatSpeakDropdown"
import MobileWorkspaceDropdown from "./MobileWorkspaceDropdown"
import MobileNavItem from "./MobileNavItem"

const MobileNavLinks = ({ onClose }) => {
  return (
    <div className="flex flex-col gap-1 text-sm">
      {navLinks.map(({ key, hasDropdown }) => {
        if (hasDropdown && key === "community") {
          return (
            <MobileCommunityDropdown key={key} navKey={key} onClose={onClose} />
          )
        }
        if (key === "catSpeak") {
          return (
            <MobileCatSpeakDropdown key={key} navKey={key} onClose={onClose} />
          )
        }
        if (key === "workspace") {
          return (
            <MobileWorkspaceDropdown key={key} navKey={key} onClose={onClose} />
          )
        }
        return <MobileNavItem key={key} navKey={key} onClose={onClose} />
      })}
    </div>
  )
}

export default MobileNavLinks
