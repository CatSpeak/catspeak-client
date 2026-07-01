import React from "react";
import PillButton from "@/shared/components/ui/buttons/PillButton";
import { useLanguage } from "@/shared/context/LanguageContext";

const LandingHeaderGuestControls = ({ onGetStarted }) => {
  const { t } = useLanguage();

  const handleLogin = () => {
    if (onGetStarted) {
      onGetStarted("login"); // Open modal
    }
  };

  return (
    <>
      <PillButton onClick={handleLogin} className="h-10">
        {t.auth.loginButton}
      </PillButton>
    </>
  );
};

export default LandingHeaderGuestControls;
