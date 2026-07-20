import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronUp, ChevronDown, Video, Film } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useAuth } from "@/features/auth";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";

const MobileWorkspaceDropdown = ({ navKey, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = useActiveLink(navKey);
  const { isAuthenticated } = useAuth();
  const authModal = useAuthModal();

  const isOnWorkspace = location.pathname.includes("/workspace");
  const [open, setOpen] = useState(isOnWorkspace);

  const subItems = [
    {
      key: "recordings",
      label: t?.recordings?.title || "Recordings",
      icon: Video,
      path: "/workspace/recordings",
    },
    {
      key: "reels",
      label: t?.catSpeak?.sidebar?.reels || "Reels",
      icon: Film,
      path: "/workspace/reels",
    },
  ];

  const getActiveSubKey = () => {
    const path = location.pathname.split("/").pop();
    if (path === "workspace") return "recordings";
    return path;
  };

  const activeSubKey = getActiveSubKey();

  const handleNavigateClick = () => {
    if (!isAuthenticated) {
      authModal.openAuthModal("login", "/workspace/recordings");
      onClose?.();
      return;
    }
    navigate("/workspace/recordings");
    onClose?.();
  };

  const handleSubItemClick = (item) => {
    if (!isAuthenticated) {
      authModal.openAuthModal("login", item.path);
      onClose?.();
      return;
    }
    navigate(item.path);
    onClose?.();
  };

  const mainLabel = t.nav?.[navKey] || "Workspace";

  return (
    <div className="flex flex-col">
      <div className="flex items-center w-full gap-1">
        {/* Navigate button */}
        <button
          onClick={handleNavigateClick}
          title={mainLabel}
          className={`flex-grow h-10 text-sm px-3 flex items-center text-left rounded-[5px] transition-colors min-w-0 ${
            isActive || open
              ? "bg-[#F2F2F2] text-cath-red-700 hover:bg-[#E6E6E6]"
              : "hover:bg-[#F2F2F2]"
          }`}
        >
          <span className="truncate min-w-0">{mainLabel}</span>
        </button>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[#F2F2F2] ${
            isActive || open ? "text-cath-red-700" : ""
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
            const Icon = item.icon;
            const isItemActive = isOnWorkspace && activeSubKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSubItemClick(item)}
                title={item.label}
                className={`flex items-center w-full px-3 h-10 text-sm rounded-[5px] text-left transition-colors min-w-0 ${
                  isItemActive
                    ? "bg-[#F2F2F2] text-cath-red-700 hover:bg-[#E6E6E6]"
                    : "hover:bg-[#F2F2F2]"
                }`}
              >
                <div className="flex-shrink-0 min-w-[32px]">
                  <Icon
                    size={18}
                    className={isItemActive ? "text-cath-red-700" : ""}
                  />
                </div>
                <span className="flex-grow text-sm truncate min-w-0">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileWorkspaceDropdown;
