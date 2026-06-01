import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { PolicyModal } from "@/features/auth"

const linkClass =
  "text-sm text-white/90 transition-colors hover:text-[#FFB400] whitespace-nowrap"

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
    <>
      <div className="w-full border-t border-white/15 pt-6 lg:pt-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:gap-6 lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
            <button
              type="button"
              className={linkClass}
              onClick={handleOpenPolicy(footerText.policies.privacy)}
            >
              {footerText.policies.privacy}
            </button>
            <button
              type="button"
              className={linkClass}
              onClick={handleOpenPolicy(footerText.policies.terms)}
            >
              {footerText.policies.terms}
            </button>
          </div>

          <p className="shrink-0 text-xs uppercase tracking-wide text-white/70">
            {footerText.copyright.replace("{year}", currentYear)}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-end">
            <button
              type="button"
              className={linkClass}
              onClick={handleOpenPolicy(footerText.policies.payment)}
            >
              {footerText.policies.payment}
            </button>
            <button
              type="button"
              className={linkClass}
              onClick={handleOpenPolicy(footerText.policies.copyright)}
            >
              {footerText.policies.copyright}
            </button>
          </div>
        </div>
      </div>

      <PolicyModal
        open={policyModal.open}
        onClose={handleClosePolicy}
        title={policyModal.title}
      />
    </>
  )
}

export default FooterBottom
