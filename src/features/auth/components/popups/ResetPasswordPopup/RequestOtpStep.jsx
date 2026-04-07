import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import AuthButton from "../../ui/AuthButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { useForgotPasswordMutation } from "@/store/api/authApi"

const RequestOtpStep = ({ onSuccess }) => {
  const { t } = useLanguage()
  const authText = t.auth || {}
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const [forgotPassword, { isLoading: isSendingOtp }] =
    useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError(authText.validationEmailRequired || "Please input your email!")
      return
    }

    try {
      const emailValue = email.trim()
      await forgotPassword({ email: emailValue }).unwrap()
      onSuccess(emailValue)
    } catch (err) {
      console.error("Failed to send OTP:", err)
      const errorMsg = err?.data?.message
      if (errorMsg === "Email not found") {
        setError(authText.emailNotFound || "Email not found")
      } else {
        setError(errorMsg || authText.sendOtpFailed || "Failed to send OTP.")
      }
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-center text-3xl font-black text-[#8f0d15]">
        {authText.forgotStep1Title || "Forgot Password?"}
      </h2>
      <p className="mb-6 text-center text-sm text-[#7A7574]">
        {authText.forgotStep1Subtitle ||
          "Enter your email address to receive a verification code."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-2 block text-sm">
            {authText.emailLabel || "Email"}
          </label>
          <TextInput
            type="email"
            variant="square"
            placeholder={authText.emailOnlyPlaceholder || "Enter your email"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("")
            }}
            className={
              error
                ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600"
                : ""
            }
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <AuthButton
          type="submit"
          disabled={isSendingOtp}
          className="w-full rounded-lg"
        >
          {isSendingOtp
            ? authText.sending || "SENDING..."
            : authText.sendOtpButton?.toUpperCase() || "SEND OTP"}
        </AuthButton>
      </form>
    </div>
  )
}

export default RequestOtpStep
