import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import MobileLanguageItem from "./MobileLanguageItem";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages";

import { getSwitchCommunityPath } from "@/shared/utils/navigation";

const DEFAULT_COMMUNITY = "zh";

const MobileCommunityDropdown = ({ navKey, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { lang } = useParams();
  const location = useLocation();
  const isActive = useActiveLink(navKey);

  const [communityOpen, setCommunityOpen] = useState(false);
  const [overrideCommunity, setOverrideCommunity] = useState(null);

  // ---- Supported codes (scalable) ----
  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), []);

  // ---- Determine current community ----
  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      localStorage.setItem("communityLanguage", lang);
      return lang;
    }

    return overrideCommunity || localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY;
  }, [lang, supportedCodes, overrideCommunity]);

  // ---- Display label ----
  const displayLabel = useMemo(() => {
    const config = LANGUAGE_CONFIG.find((c) => c.code === currentCommunity);

    return (
      t.header?.countries?.[config?.labelKey] ||
      config?.fallbackLabel ||
      t.nav?.[navKey]
    );
  }, [currentCommunity, t, navKey]);

  // ---- Navigate to community root ----
  const handleNavigateClick = () => {
    navigate(`/${currentCommunity}/community`);
    onClose?.();
  };

  // ---- Switch community ----
  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      setCommunityOpen(false);
      return;
    }

    localStorage.setItem("communityLanguage", newCode);
    setCommunityOpen(false);

    const isInsideEcosystem =
      supportedCodes.includes(lang) ||
      location.pathname === `/${currentCommunity}` ||
      location.pathname.startsWith(`/${currentCommunity}/`);

    if (isInsideEcosystem) {
      window.location.href = getSwitchCommunityPath(location.pathname, currentCommunity, newCode);
    } else {
      window.location.reload();
    }

    onClose?.();
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center w-full gap-1">
        {/* Navigate button */}
        <button
          onClick={handleNavigateClick}
          title={displayLabel}
          className={`flex-grow h-10 text-sm px-3 flex items-center text-left rounded-[5px] transition-colors min-w-0 ${
            isActive || communityOpen
              ? "bg-primaryBg text-cath-red-700 hover:bg-[#E6E6E6]"
              : "hover:bg-primaryBg"
          }`}
        >
          <span className="truncate min-w-0">{displayLabel}</span>
        </button>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCommunityOpen((prev) => !prev);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-[5px] transition-colors hover:bg-primaryBg ${
            isActive || communityOpen ? "text-cath-red-700" : ""
          }`}
        >
          {communityOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Collapse Container */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          communityOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 mt-1">
          {LANGUAGE_CONFIG.map((config) => {
            if (config.code === "vi") return null;
            return (
              <MobileLanguageItem
                key={config.code}
                {...config}
                label={
                  t.header?.countries?.[config.labelKey] || config.fallbackLabel
                }
                soonLabel={t.header?.soon || "Soon"}
                isActive={currentCommunity === config.code}
                onSelect={() => handleCommunitySelect(config.code)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileCommunityDropdown;
