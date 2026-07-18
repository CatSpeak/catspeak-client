import { useState } from "react"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import PolicyModal from "../PolicyModal"

const AgreementSection = ({ authText, formData, onChange }) => {
  const [policyModal, setPolicyModal] = useState({ open: false, title: "" })

  const handleOpenPolicy = (title) => (e) => {
    e.preventDefault()
    setPolicyModal({ open: true, title })
  }

  const handleClosePolicy = () => {
    setPolicyModal({ open: false, title: "" })
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Terms and Privacy */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.termsAgreement}
            onChange={onChange("termsAgreement")}
          />
          <span className="text-sm">
            {authText.agreePrefix}{" "}
            <button
              type="button"
              className="font-semibold text-[#8f0d15] hover:underline"
              onClick={handleOpenPolicy(authText.serviceTerms)}
            >
              {authText.serviceTerms}
            </button>{" "}
            {authText.and}{" "}
            <button
              type="button"
              className="font-semibold text-[#8f0d15] hover:underline"
              onClick={handleOpenPolicy(authText.privacyPolicy)}
            >
              {authText.privacyPolicy}
            </button>{" "}
            {authText.companySuffix}
          </span>
        </label>

        {/* Payment and IP */}
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.policyAgreement}
            onChange={onChange("policyAgreement")}
          />
          <span className="text-sm">
            {authText.agreePrefix}{" "}
            <button
              type="button"
              className="font-semibold text-[#8f0d15] hover:underline"
              onClick={handleOpenPolicy(authText.paymentPolicy)}
            >
              {authText.paymentPolicy}
            </button>{" "}
            {authText.and}{" "}
            <button
              type="button"
              className="font-semibold text-[#8f0d15] hover:underline"
              onClick={handleOpenPolicy(authText.ipPolicy)}
            >
              {authText.ipPolicy}
            </button>{" "}
            {authText.companySuffix}
          </span>
        </label>
      </div>

      {/* Policy Modal */}
      <PolicyModal
        open={policyModal.open}
        onClose={handleClosePolicy}
        title={policyModal.title}
      />
    </>
  )
}

export default AgreementSection
