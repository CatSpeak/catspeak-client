import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";

const CommunitySection = ({ languages }) => {
  const { t } = useLanguage();
  const footerText = t.footer;

  return (
    <div className="flex-1 text-left mt-[2px]">

      <h3 className="font-bold uppercase tracking-wide text-base sm:text-lg">
        {footerText.ourCommunity}
      </h3>

      <ul className="pt-4 sm:pt-6 text-white/85 flex flex-col justify-start items-start gap-3 lg:gap-2">
        {languages.map((lang) => (
          <li key={lang} className="drop-shadow-md">
            <span className="font-bold text-sm sm:text-base">{lang}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunitySection;
