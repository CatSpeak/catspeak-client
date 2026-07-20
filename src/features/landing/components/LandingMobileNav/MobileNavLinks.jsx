import React from "react";
import MobileCommunityDropdown from "./MobileCommunityDropdown";
import MobileCatSpeakDropdown from "./MobileCatSpeakDropdown";
import MobileWorkspaceDropdown from "./MobileWorkspaceDropdown";
import { navLinks } from "@/features/navigation";
import MobileNavItem from "./MobileNavItem";
import { useAuth } from "@/features/auth";

const MobileNavLinks = ({ onClose }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col gap-1 text-sm">
      {navLinks
        .filter((item) => {
          if (item.isPrivate && !isAuthenticated) return false;
          return true;
        })
        .map(({ key, hasDropdown }) => {
        if (hasDropdown && key === "community") {
          return (
            <MobileCommunityDropdown key={key} navKey={key} onClose={onClose} />
          );
        }
        if (key === "catSpeak") {
          return (
            <MobileCatSpeakDropdown key={key} navKey={key} onClose={onClose} />
          );
        }
        if (key === "workspace" && hasDropdown === "false") {
          return (
            <MobileWorkspaceDropdown key={key} navKey={key} onClose={onClose} />
          );
        }
        return <MobileNavItem key={key} navKey={key} onClose={onClose} />;
      })}
    </div>
  );
};

export default MobileNavLinks;
