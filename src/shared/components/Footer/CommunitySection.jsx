import React from "react"
import { Link } from "react-router-dom"
import { IconLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

const COMMUNITY_LINKS = [
  { code: "vi", labelKey: "vietnamese" },
  { code: "en", labelKey: "english" },
  { code: "zh", labelKey: "chinese" },
]

const CommunitySection = () => {
  const { t } = useLanguage()
  const footerText = t.footer

  return (
    <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
      <Link to="/" aria-label="Cat Speak Home" className="shrink-0">
        <img
          src={IconLogo}
          alt=""
          className="h-16 w-16 sm:h-[72px] sm:w-[72px]"
          draggable={false}
        />
      </Link>

      <div>
        <h3 className="text-base font-bold uppercase tracking-wide text-white sm:text-lg">
          {footerText.ourCommunity}
        </h3>
        <ul className="mt-4 flex flex-col gap-2 sm:gap-2.5">
          {COMMUNITY_LINKS.map(({ code, labelKey }) => (
            <li key={code}>
              <Link
                to={`/${code}/community`}
                className="text-sm font-semibold text-white/90 transition-colors hover:text-[#FFB400] sm:text-base"
              >
                {footerText.languages[labelKey]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CommunitySection
