import { useLanguage } from "@/shared/context/LanguageContext";
import { communityCodeFromValue } from "../utils/community";

/**
 * Small pill showing which community an Event belongs to. Renders nothing for
 * legacy events that are not assigned to a community.
 */
const CommunityBadge = ({ languageCommunity, className = "" }) => {
  const { t } = useLanguage();
  const code = communityCodeFromValue(languageCommunity);
  if (!code) return null;

  const label = t.header?.languages?.[code] || code;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#990011]/10 text-[#990011] shrink-0 ${className}`}
    >
      {label}
    </span>
  );
};

export default CommunityBadge;
