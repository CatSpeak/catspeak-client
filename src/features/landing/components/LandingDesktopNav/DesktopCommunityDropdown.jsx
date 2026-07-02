import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";
import { useLanguage } from "@/shared/context/LanguageContext";

import LanguageMenuItem from "@/shared/components/Header/LanguageMenuItem";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages";

const DEFAULT_COMMUNITY = "zh";

const DesktopCommunityDropdown = ({ navKey }) => {
  const { t } = useLanguage();
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = useActiveLink(navKey);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ---- Supported codes (dynamic, scalable) ----
  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), []);

  // ---- Determine current community (URL first, then localStorage) ----
  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      localStorage.setItem("communityLanguage", lang);
      return lang;
    }

    return localStorage.getItem("communityLanguage") || DEFAULT_COMMUNITY;
  }, [lang, supportedCodes]);

  // ---- Derive label (no state needed) ----
  const selectedLabel = useMemo(() => {
    const config = LANGUAGE_CONFIG.find((c) => c.code === currentCommunity);

    return (
      t.header?.countries?.[config?.labelKey] ||
      config?.fallbackLabel ||
      "Community"
    );
  }, [currentCommunity, t]);

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Switch community ----
  const handleCommunitySelect = (newCode) => {
    if (newCode === currentCommunity) {
      setIsOpen(false);
      return;
    }

    localStorage.setItem("communityLanguage", newCode);
    setIsOpen(false);

    const isInsideEcosystem =
      location.pathname.startsWith(`/${currentCommunity}/community`) ||
      location.pathname.startsWith(`/${currentCommunity}/cat-speak`);

    if (isInsideEcosystem) {
      // Replace only the first segment
      const newPath = location.pathname.replace(
        `/${currentCommunity}`,
        `/${newCode}`,
      );
      window.location.href = newPath;
    } else {
      window.location.href = `/${newCode}/community`;
    }
  };

  // ---- Navigate to current community root ----
  const handleCommunityClick = () => {
    navigate(`/${currentCommunity}/community`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-center text-base tracking-wide font-bold transition-colors duration-200 ${
          isOpen || isActive
            ? "text-[#990011]"
            : "text-black hover:text-[#990011]"
        }`}
      >
        {/* Community navigation */}
        <div
          onClick={handleCommunityClick}
          className="h-10 flex items-center pl-6 pr-1 rounded-l-full cursor-pointer hover:bg-gray-100/50 transition-colors"
        >
          {selectedLabel || t.nav?.[navKey]}
        </div>

        {/* Dropdown toggle */}
        <div className="relative">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="h-10 w-8 flex items-center justify-center rounded-r-full hover:bg-gray-100/50 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          <AnimatePresence>
            {isOpen && (
              <div className="absolute top-full right-0 mt-2 min-w-[220px] z-50">
                <FluentAnimation
                  direction="down"
                  exit
                  className="rounded-lg border border-[#E5E5E5] shadow-lg bg-white overflow-hidden"
                >
                  <div className="flex flex-col gap-1 p-1 whitespace-nowrap">
                    {LANGUAGE_CONFIG.map((config) => {
                      if (config.code === "vi") return null;
                      return (
                        <LanguageMenuItem
                          key={config.code}
                          {...config}
                          isActive={currentCommunity === config.code}
                          label={
                            t.header?.countries?.[config.labelKey] ||
                            config.fallbackLabel
                          }
                          soonLabel={t.header?.soon || "Soon"}
                          onSelect={() => handleCommunitySelect(config.code)}
                        />
                      );
                    })}
                  </div>
                </FluentAnimation>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DesktopCommunityDropdown;
