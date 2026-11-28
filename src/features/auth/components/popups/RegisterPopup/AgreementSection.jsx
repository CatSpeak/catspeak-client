import { useState } from "react"
import Checkbox from "@/shared/components/ui/inputs/Checkbox"
import PolicyModal from "../PolicyModal"

const AgreementSection = ({ authText, formData, errors = {}, onChange }) => {
  const [policyModal, setPolicyModal] = useState({
    open: false,
    title: "",
    policyKey: "",
  })

  const handleOpenPolicy = (title, policyKey) => (e) => {
    e.preventDefault()
    setPolicyModal({ open: true, title, policyKey })
  }

  const handleClosePolicy = () => {
    setPolicyModal({ open: false, title: "", policyKey: "" })
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Terms and Privacy */}
        <div>
          <div className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={formData.termsAgreement}
              onChange={onChange("termsAgreement")}
            />
            <span className="text-sm">
              {authText.agreePrefix}{" "}
              <button
                type="button"
                className="font-semibold text-primary dark:text-red-400 hover:underline"
                onClick={handleOpenPolicy(authText.serviceTerms, "terms")}
              >
                {authText.serviceTerms}
              </button>{" "}
              {authText.and}{" "}
              <button
                type="button"
                className="font-semibold text-primary dark:text-red-400 hover:underline"
                onClick={handleOpenPolicy(authText.privacyPolicy, "privacy")}
              >
                {authText.privacyPolicy}
              </button>{" "}
              {authText.companySuffix}
            </span>
          </div>
          {errors.termsAgreement && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.termsAgreement}</p>
          )}
        </div>

        {/* Payment and IP */}
        <div>
          <div className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={formData.policyAgreement}
              onChange={onChange("policyAgreement")}
            />
            <span className="text-sm">
              {authText.agreePrefix}{" "}
              <button
                type="button"
                className="font-semibold text-primary dark:text-red-400 hover:underline"
                onClick={handleOpenPolicy(authText.paymentPolicy, "payment")}
              >
                {authText.paymentPolicy}
              </button>{" "}
              {authText.and}{" "}
              <button
                type="button"
                className="font-semibold text-primary dark:text-red-400 hover:underline"
                onClick={handleOpenPolicy(authText.ipPolicy, "ip")}
              >
                {authText.ipPolicy}
              </button>{" "}
              {authText.companySuffix}
            </span>
          </div>
          {errors.policyAgreement && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.policyAgreement}
            </p>
          )}
        </div>

        {/* Email Notification Opt-in */}
        <div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={formData.isEmailNotificationEnabled ?? true}
              onChange={onChange("isEmailNotificationEnabled")}
            />
            <span className="text-sm text-secondary font-medium">
              {authText.emailOptIn ||
                "Tôi muốn nhận email thông báo & tin tức cập nhật từ CatSpeak"}
            </span>
          </label>
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

export default AgreementSection
