import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

import { PolicyModal } from "@/features/auth"

const FooterBottom = () => {
  const { t } = useLanguage()
  const footerText = t.footer
  const currentYear = new Date().getFullYear()

  const [policyModal, setPolicyModal] = useState({ open: false, title: "" })

  const handleOpenPolicy = (title) => () => {
    setPolicyModal({ open: true, title })
  }

  const handleClosePolicy = () => {
    setPolicyModal({ open: false, title: "" })
  }

  return (
    <div className="w-full px-4 lg:px-12 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
      <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4 lg:gap-0">
        {/* Left policies */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-8 text-yellow-300 text-center lg:text-left order-2 lg:order-1 px-4 lg:px-0">
          <button
            type="button"
            className="hover:text-yellow-400 transition"
            onClick={handleOpenPolicy(footerText.policies.privacy)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.privacy}
            </span>
          </button>
          <button
            type="button"
            className="hover:text-yellow-400 transition"
            onClick={handleOpenPolicy(footerText.policies.terms)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.terms}
            </span>
          </button>
        </div>

        {/* Center copyright */}
        <div className="text-gray-400 uppercase text-center flex-shrink-0 mx-4 order-3 lg:order-2">
          <span className="text-xs">
            {footerText.copyright.replace("{year}", currentYear)}
          </span>
        </div>

        {/* Right policies */}
        <div className="flex flex-wrap justify-center lg:justify-end gap-4 lg:gap-8 text-yellow-300 text-center lg:text-right order-1 lg:order-3 px-4 lg:px-0">
          <button
            type="button"
            className="hover:text-yellow-400 transition"
            onClick={handleOpenPolicy(footerText.policies.payment)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.payment}
            </span>
          </button>
          <button
            type="button"
            className="hover:text-yellow-400 transition"
            onClick={handleOpenPolicy(footerText.policies.copyright)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.copyright}
            </span>
          </button>
        </div>
      </div>

      <PolicyModal
        open={policyModal.open}
        onClose={handleClosePolicy}
        title={policyModal.title}
      />
    </div>
  )
}

export default FooterBottom
