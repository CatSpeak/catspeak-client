import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import RequestOtpStep from "@/features/auth/components/popups/ResetPasswordPopup/RequestOtpStep"
import VerifyOtpStep from "@/features/auth/components/popups/ResetPasswordPopup/VerifyOtpStep"
import ResetPasswordFormStep from "@/features/auth/components/popups/ResetPasswordPopup/ResetPasswordFormStep"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"

const STEPS = {
  REQUEST_OTP: 0,
  VERIFY_OTP: 1,
  RESET_PASSWORD: 2,
  SUCCESS: 3,
}

const ResetPasswordPage = () => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryEmail = searchParams.get("email") || ""
  const queryToken = searchParams.get("token") || ""

  const [currentStep, setCurrentStep] = useState(() => {
    if (queryEmail && queryToken) return STEPS.RESET_PASSWORD
    if (queryEmail) return STEPS.VERIFY_OTP
    return STEPS.REQUEST_OTP
  })
  const [email, setEmail] = useState(queryEmail)
  const [token, setToken] = useState(queryToken)

  const handleSwitchMode = (mode) => {
    // ISS-37/ISS-45: hand off to MainLayout's shared auth modal instead of
    // dropping the user on the landing page with no modal open.
    navigate("/", {
      replace: mode === "login",
      state: {
        requireLogin: true,
        authMode: mode === "register" ? "register" : "login",
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] p-6 sm:p-8 shadow-xl">
        {currentStep === STEPS.VERIFY_OTP && (
          <div className="mb-2">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(STEPS.REQUEST_OTP)}
              title={authText.back || "Quay lại"}
            >
              <ArrowLeft />
            </IconButton>
          </div>
        )}

        {currentStep === STEPS.SUCCESS && (
          <div className="text-center py-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-emerald-950/40">
              <CheckCircle2 className="h-12 w-12 text-green-500 dark:text-emerald-400" />
            </div>
            <h2 className="mb-2 text-center text-3xl font-bold text-primary dark:text-red-400">
              {authText.passwordChangedTitle || "Đổi mật khẩu thành công!"}
            </h2>
            <p className="mb-8 text-center text-sm text-secondary">
              {authText.passwordChangedSubtitle ||
                "Mật khẩu của bạn đã được cập nhật thành công."}
            </p>
            <PillButton
              onClick={() =>
                navigate("/", {
                  replace: true,
                  state: { requireLogin: true, authMode: "login" },
                })
              }
              className="w-full"
            >
              {authText.loginNowButton || "Đăng nhập ngay"}
            </PillButton>
          </div>
        )}

        {currentStep === STEPS.REQUEST_OTP && (
          <RequestOtpStep
            onSuccess={(submittedEmail) => {
              setEmail(submittedEmail)
              setCurrentStep(STEPS.VERIFY_OTP)
            }}
            onSwitchMode={handleSwitchMode}
          />
        )}

        {currentStep === STEPS.VERIFY_OTP && (
          <VerifyOtpStep
            email={email}
            onSuccess={(otpToken) => {
              setToken(otpToken)
              setCurrentStep(STEPS.RESET_PASSWORD)
            }}
            onBack={() => setCurrentStep(STEPS.REQUEST_OTP)}
            onSwitchMode={handleSwitchMode}
          />
        )}

        {currentStep === STEPS.RESET_PASSWORD && (
          <ResetPasswordFormStep
            email={email}
            token={token}
            onSuccess={() => setCurrentStep(STEPS.SUCCESS)}
            onSwitchMode={handleSwitchMode}
          />
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
