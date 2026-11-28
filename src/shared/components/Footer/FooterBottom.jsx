import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { PolicyModal } from "@/features/auth"

const FooterBottom = () => {
  const { t } = useLanguage()
  const footerText = t.footer
  const [policyModal, setPolicyModal] = useState({
    open: false,
    title: "",
    policyKey: "",
  })

  const policies = [
    { key: "privacy", title: footerText?.policies?.privacy },
    { key: "terms", title: footerText?.policies?.terms },
    { key: "payment", title: footerText?.policies?.payment },
  ]

  const openPolicy = (policy) => () =>
    setPolicyModal({
      open: true,
      title: policy.title,
      policyKey: policy.key,
    })
  const closePolicy = () =>
    setPolicyModal({ open: false, title: "", policyKey: "" })

  return (
    <>
      <nav
        aria-label={footerText?.policies?.navAriaLabel || "Chính sách"}
        className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end"
      >
        {policies.map((policy) => (
          <button
            key={policy.key}
            type="button"
            className="text-left text-xs text-gray-400 transition-colors hover:text-white"
            onClick={openPolicy(policy)}
          >
            {policy.title}
          </button>
        ))}
      </nav>
      <PolicyModal
        open={policyModal.open}
        onClose={closePolicy}
        title={policyModal.title}
        policyKey={policyModal.policyKey}
      />
    </>
  )
}

export default FooterBottom
