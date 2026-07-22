import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import AuthButton from "../../ui/AuthButton";
import RequestOtpStep from "./RequestOtpStep";
import VerifyOtpStep from "./VerifyOtpStep";
import ResetPasswordFormStep from "./ResetPasswordFormStep";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";

const STEPS = {
  REQUEST_OTP: 0,
  VERIFY_OTP: 1,
  RESET_PASSWORD: 2,
  SUCCESS: 3,
};

const ResetPasswordPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage();
  const authText = t.auth || {};
  const [currentStep, setCurrentStep] = useState(STEPS.REQUEST_OTP);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const handleEmailSubmitted = (submittedEmail) => {
    setEmail(submittedEmail);
    setCurrentStep(STEPS.VERIFY_OTP);
  };

  const handleOtpVerified = (otpToken) => {
    setToken(otpToken);
    setCurrentStep(STEPS.RESET_PASSWORD);
  };

  const handlePasswordResetSuccess = () => {
    setCurrentStep(STEPS.SUCCESS);
  };

  const handleBackToRequest = () => {
    setCurrentStep(STEPS.REQUEST_OTP);
  };

  const renderSuccess = () => (
    <div className="text-center py-6 px-2">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="mb-3 text-2xl font-bold text-gray-900">
        {authText.passwordChangedTitle || "Đổi mật khẩu thành công"}
      </h2>
      <p className="mb-8 text-sm text-[#7A7574]">
        {authText.passwordChangedSubtitle ||
          "Mật khẩu của bạn đã được cập nhật thành công!"}
      </p>
      <AuthButton onClick={() => onSwitchMode("login")}>
        {authText.loginNowButton || "Đăng nhập ngay"}
      </AuthButton>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={currentStep !== STEPS.SUCCESS}
      className="md:max-w-[650px]   "
      bodyClassName="px-5 pb-6 flex-1 overflow-y-auto"
    >
      {currentStep === STEPS.SUCCESS && renderSuccess()}

      {currentStep === STEPS.REQUEST_OTP && (
        <RequestOtpStep onSuccess={handleEmailSubmitted} />
      )}

      {currentStep === STEPS.VERIFY_OTP && (
        <VerifyOtpStep
          email={email}
          onSuccess={handleOtpVerified}
          onBack={handleBackToRequest}
        />
      )}

      {currentStep === STEPS.RESET_PASSWORD && (
        <ResetPasswordFormStep
          email={email}
          token={token}
          onSuccess={handlePasswordResetSuccess}
        />
      )}
    </Modal>
  );
};

export default ResetPasswordPopup;
