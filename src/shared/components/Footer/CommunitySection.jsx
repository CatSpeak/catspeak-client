import React from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { LandingPageIcon } from "@/features/landing/assets";

const CommunitySection = ({ languages }) => {
  const { t } = useLanguage();
  const footerText = t.footer;

  return (
    <div className="flex-1 text-left">
      <div className="col-span-1 w-full pb-4 pr-4">
        <img src={LandingPageIcon} alt="logo" className="w-[84px] h-[84px]" />
      </div>
      <h3 className="font-bold uppercase tracking-wide text-lg">
        {footerText.ourCommunity}
      </h3>
      <ul className="pt-6 text-white/85 flex flex-col justify-start items-start gap-4 lg:gap-2">
        {languages.map((lang) => (
          <li key={lang} className="drop-shadow-md">
            <span className="text-white font-bold text-base">{lang}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunitySection;
