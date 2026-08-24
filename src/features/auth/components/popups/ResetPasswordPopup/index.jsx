import { useState } from "react"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import RequestOtpStep from "./RequestOtpStep"
import VerifyOtpStep from "./VerifyOtpStep"
import ResetPasswordFormStep from "./ResetPasswordFormStep"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

const STEPS = {
  REQUEST_OTP: 0,
  VERIFY_OTP: 1,
  RESET_PASSWORD: 2,
  SUCCESS: 3,
}

const ResetPasswordPopup = ({ open, onClose, onSwitchMode }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const [currentStep, setCurrentStep] = useState(STEPS.REQUEST_OTP)
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")

  const handleClose = () => {
    setCurrentStep(STEPS.REQUEST_OTP)
    setEmail("")
    setToken("")
    onClose()
  }

  const handleEmailSubmitted = (submittedEmail) => {
    setEmail(submittedEmail)
    setCurrentStep(STEPS.VERIFY_OTP)
  }

  const handleOtpVerified = (otpToken) => {
    setToken(otpToken)
    setCurrentStep(STEPS.RESET_PASSWORD)
  }

  const handlePasswordResetSuccess = () => {
    setCurrentStep(STEPS.SUCCESS)
  }

  const handleBackToRequest = () => {
    setCurrentStep(STEPS.REQUEST_OTP)
  }

  const renderSuccess = () => (
    <div className="text-center py-4">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="mb-2 text-center text-3xl font-bold text-primary">
        {authText.passwordChangedTitle || "Đổi mật khẩu thành công!"}
      </h2>
      <p className="mb-8 text-center text-sm text-secondary">
        {authText.passwordChangedSubtitle ||
          "Mật khẩu của bạn đã được cập nhật thành công."}
      </p>
      <PillButton
        onClick={() => {
          handleClose()
          onSwitchMode("login")
        }}
        className="w-full"
      >
        {authText.loginNowButton || "Đăng nhập ngay"}
      </PillButton>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      showCloseButton={currentStep !== STEPS.SUCCESS}
      className="max-w-lg rounded-none md:rounded-xl md:border md:border-border"
      headerClassName="flex items-center justify-between p-4 sm:p-6 pb-0"
      title={
        currentStep === STEPS.VERIFY_OTP ? (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleBackToRequest}
            title={authText.back || "Quay lại"}
          >
            <ArrowLeft />
          </IconButton>
        ) : null
      }
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footerClassName="p-4 sm:p-6"
    >
      {currentStep === STEPS.SUCCESS && renderSuccess()}

      {currentStep === STEPS.REQUEST_OTP && (
        <RequestOtpStep
          onSuccess={handleEmailSubmitted}
          onSwitchMode={onSwitchMode}
        />
      )}

      {currentStep === STEPS.VERIFY_OTP && (
        <VerifyOtpStep
          email={email}
          onSuccess={handleOtpVerified}
          onBack={handleBackToRequest}
          onSwitchMode={onSwitchMode}
        />
      )}

      {currentStep === STEPS.RESET_PASSWORD && (
        <ResetPasswordFormStep
          email={email}
          token={token}
          onSuccess={handlePasswordResetSuccess}
          onSwitchMode={onSwitchMode}
        />
      )}
    </Modal>
  )
}

export default ResetPasswordPopup
