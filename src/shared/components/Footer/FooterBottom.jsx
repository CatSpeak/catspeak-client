import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { PolicyModal } from "@/features/auth"

const FooterBottom = () => {
  const { t } = useLanguage()
  const footerText = t.footer
  const [policyModal, setPolicyModal] = useState({ open: false, title: "" })

  const openPolicy = (title) => () => setPolicyModal({ open: true, title })
  const closePolicy = () => setPolicyModal({ open: false, title: "" })

  return (
    <>
      <nav
        aria-label="Chính sách"
        className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end"
      >
        {[
          footerText.policies.privacy,
          footerText.policies.terms,
          footerText.policies.payment,
        ].map((title) => (
          <button
            key={title}
            type="button"
            className="text-left text-xs text-gray-400 transition-colors hover:text-white"
            onClick={openPolicy(title)}
          >
            {title}
          </button>
        ))}
      </nav>
      <PolicyModal
        open={policyModal.open}
        onClose={closePolicy}
        title={policyModal.title}
      />
    </>
  )
}

export default FooterBottom
