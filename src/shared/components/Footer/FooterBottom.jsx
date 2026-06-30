import { useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";

import { PolicyModal } from "@/features/auth";

const FooterBottom = ({ mode }) => {
  const { t } = useLanguage();
  const footerText = t.footer;
  const currentYear = new Date().getFullYear();

  const [policyModal, setPolicyModal] = useState({ open: false, title: "" });

  const handleOpenPolicy = (title) => () => {
    setPolicyModal({ open: true, title });
  };

  const handleClosePolicy = () => {
    setPolicyModal({ open: false, title: "" });
  };

  // Mobile specific policy links used in the upper part of the footer
  if (mode === "mobile-policies") {
    return (
      <>
        <div className="flex flex-col items-end gap-2 text-right pt-4">
          <button
            type="button"
            className="text-white hover:text-gray-200 transition text-sm whitespace-nowrap"
            onClick={handleOpenPolicy(footerText.policies.privacy)}
          >
            {footerText.policies.privacy}
          </button>
          <button
            type="button"
            className="text-white hover:text-gray-200 transition text-sm whitespace-nowrap"
            onClick={handleOpenPolicy(footerText.policies.terms)}
          >
            {footerText.policies.terms}
          </button>
          <button
            type="button"
            className="text-white hover:text-gray-200 transition text-sm whitespace-nowrap"
            onClick={handleOpenPolicy(footerText.policies.copyright)}
          >
            {footerText.policies.copyright}
          </button>
          <button
            type="button"
            className="text-white hover:text-gray-200 transition text-sm whitespace-nowrap"
            onClick={handleOpenPolicy(footerText.policies.payment)}
          >
            {footerText.policies.payment}
          </button>
        </div>
        <PolicyModal
          open={policyModal.open}
          onClose={handleClosePolicy}
          title={policyModal.title}
        />
      </>
    );
  }

  return (
    <div className="w-full px-4 lg:px-8 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
      <div className="flex flex-col lg:flex-row items-center justify-between py-4 gap-4 lg:gap-0">
        {/* Left policies - Hidden on mobile because they show in 'mobile-policies' mode above */}
        <div className="hidden lg:flex flex-wrap justify-start gap-8 text-white text-left order-1 px-0">
          <button
            type="button"
            className="hover:text-gray-100 transition"
            onClick={handleOpenPolicy(footerText.policies.privacy)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.privacy}
            </span>
          </button>
          <button
            type="button"
            className="hover:text-gray-100 transition"
            onClick={handleOpenPolicy(footerText.policies.terms)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.terms}
            </span>
          </button>
        </div>

        {/* Center copyright - Always visible, centered on mobile */}
        <div className="text-gray-400 uppercase text-center flex-shrink-0 mx-4 order-3 lg:order-2">
          <span className="text-xs">
            {footerText.copyright.replace("{year}", currentYear)}
          </span>
        </div>

        {/* Right policies - Hidden on mobile because they show in 'mobile-policies' mode above */}
        <div className="hidden lg:flex flex-wrap justify-end gap-8 text-white text-right order-3 px-0">
          <button
            type="button"
            className="hover:text-gray-100 transition"
            onClick={handleOpenPolicy(footerText.policies.payment)}
          >
            <span className="text-sm whitespace-nowrap">
              {footerText.policies.payment}
            </span>
          </button>
          <button
            type="button"
            className="hover:text-gray-100 transition"
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
  );
};

export default FooterBottom;
