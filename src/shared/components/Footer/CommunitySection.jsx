import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"


const CommunitySection = ({ languages }) => {
  const { t } = useLanguage()
  const footerText = t.footer

  return (
    <div className="flex-1 text-center lg:text-left">
      <h3
        className="font-bold uppercase tracking-wide text-lg"
      >
        {footerText.ourCommunity}
      </h3>
      <ul className="pt-6 text-white/85 flex flex-row flex-wrap justify-center lg:flex-col lg:justify-start lg:items-start gap-4 lg:gap-2">
        {languages.map((lang) => (
          <li key={lang} className="drop-shadow-md">
            <span className="text-white font-bold text-base">
              {lang}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CommunitySection
