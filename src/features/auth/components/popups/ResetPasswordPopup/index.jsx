import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import AuthButton from "../../ui/AuthButton"
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

  // --- Handlers ---

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
    // Auto switch to login after delay
    setTimeout(() => {
      onSwitchMode("login")
    }, 3000)
  }

  const handleBackToRequest = () => {
    setCurrentStep(STEPS.REQUEST_OTP)
  }

  // --- Render Steps ---

  const renderSuccess = () => (
    <div className="text-center py-4">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        {authText.passwordChangedTitle || "Password Changed!"}
      </h2>
      <p className="mb-8 text-sm text-gray-600">
        {authText.passwordChangedSubtitle || "Your password has been successfully updated."}
      </p>
      <AuthButton
        onClick={() => onSwitchMode("login")}
        className="w-full rounded-lg"
      >
        {authText.loginNowButton || "LOGIN NOW"}
      </AuthButton>
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="" bodyClassName="px-3 pb-6 flex-1 overflow-y-auto">
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
  )
}

export default ResetPasswordPopup
