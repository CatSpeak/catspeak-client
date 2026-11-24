import React, { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
} from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext.jsx"
import { useSubmitLock } from "@/shared/hooks/useSubmitLock"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { resolveLocalizedError } from "@/shared/utils/apiError"
import { resolveGeneralErrorMessage } from "@/features/auth/utils/registerErrors"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"

const VerifyEmailPage = () => {
  const { t } = useLanguage()
  const authText = useMemo(() => t.auth || {}, [t])
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const initialOtp = searchParams.get("otp") || ""

  const [verifyEmailOtp, { isLoading: isVerifyingOtp }] =
    useVerifyEmailOtpMutation()
  const [resendEmailOtp, { isLoading: isResendingOtp }] =
    useResendEmailOtpMutation()
  const { runLocked } = useSubmitLock()

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState(initialOtp)
  const [status, setStatus] = useState(
    initialEmail && initialOtp ? "verifying" : "form",
  ) // form | verifying | success | error
  const [errorMsg, setErrorMsg] = useState("")
  const [resendMsg, setResendMsg] = useState("")
  const autoVerifiedRef = useRef(false)

  useEffect(() => {
    if (!initialEmail || !initialOtp || autoVerifiedRef.current) return
    autoVerifiedRef.current = true
    let mounted = true

    const verify = async () => {
      try {
        await verifyEmailOtp({
          email: initialEmail.trim(),
          otp: initialOtp.trim(),
        }).unwrap()
        try {
          sessionStorage.setItem("catspeak_just_registered", "true")
        } catch {
          /* ignore storage error */
        }
        if (mounted) setStatus("success")
      } catch (err) {
        if (mounted) {
          setErrorMsg(
            resolveLocalizedError(
              err,
              (e) => resolveGeneralErrorMessage(e, authText),
              authText.verifyOtpFailed ||
                "The verification code is invalid or has expired.",
            ),
          )
          setStatus("error")
        }
      }
    }

    verify()
    return () => {
      mounted = false
    }
  }, [initialEmail, initialOtp, verifyEmailOtp, authText])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    await runLocked(async () => {
      setErrorMsg("")
      setResendMsg("")
      const trimmedEmail = email.trim()
      const trimmedOtp = otp.trim()
      if (!trimmedEmail) {
        setErrorMsg(authText.validationEmailRequired || "Vui lòng nhập email")
        return
      }
      if (!trimmedOtp || trimmedOtp.length !== 6) {
        setErrorMsg(
          authText.validationOtpLength || "Mã OTP phải có 6 chữ số",
        )
        return
      }

      try {
        await verifyEmailOtp({ email: trimmedEmail, otp: trimmedOtp }).unwrap()
        try {
          sessionStorage.setItem("catspeak_just_registered", "true")
        } catch {
          /* ignore storage error */
        }
        setStatus("success")
      } catch (err) {
        setErrorMsg(
          resolveLocalizedError(
            err,
            (e) => resolveGeneralErrorMessage(e, authText),
            authText.verifyOtpFailed || "Invalid or expired OTP.",
          ),
        )
      }
    })
  }

  const handleResend = async () => {
    await runLocked(async () => {
      setErrorMsg("")
      setResendMsg("")
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        setErrorMsg(authText.validationEmailRequired || "Vui lòng nhập email")
        return
      }
      try {
        await resendEmailOtp({ email: trimmedEmail }).unwrap()
        setResendMsg(
          authText.otpResentSuccess || "Mã OTP đã được gửi lại thành công",
        )
      } catch (err) {
        setErrorMsg(
          resolveLocalizedError(
            err,
            (e) => resolveGeneralErrorMessage(e, authText),
            authText.sendOtpFailed || "Gửi OTP thất bại.",
          ),
        )
      }
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 dark:bg-[#0F0F0F] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] p-8 shadow-xl text-center">
        {status === "verifying" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cath-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {authText.verifying || "Verifying your email..."}
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {authText.emailVerifiedTitle || "Email Verified Successfully!"}
              </h2>
              <p className="text-gray-600 dark:text-neutral-300">
                {authText.emailVerifiedSubtitle ||
                  "Thank you for verifying your email address. You can now use all features of Cat Speak."}
              </p>
            </div>
            <Link to="/">
              <PillButton className="px-8">
                {authText.backToHome || "Go to Home"}
              </PillButton>
            </Link>
          </div>
        )}

        {(status === "form" || status === "error") && (
          <div className="text-left">
            <div className="text-center mb-6">
              {status === "error" && (
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {authText.verifyEmailTitle || "Verify Your Email"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-neutral-300">
                {authText.verifyEmailOtpSubtitle ||
                  "Enter the 6-digit verification code sent to your email."}
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <TextInput
                label={authText.emailLabel || "Email"}
                labelClassName="text-secondary"
                required
                type="email"
                variant="square"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrorMsg("")
                }}
              />
              <TextInput
                label={authText.otpLabel || "Mã OTP"}
                labelClassName="text-secondary"
                required
                type="text"
                inputMode="numeric"
                variant="square"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={authText.otpPlaceholder || "Nhập mã OTP 6 chữ số"}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""))
                  setErrorMsg("")
                }}
                className="text-center text-lg tracking-widest"
              />

              {resendMsg && (
                <div className="rounded-lg bg-green-50 dark:bg-emerald-950/40 py-2.5 px-3 text-sm text-green-700 dark:text-emerald-300 text-center">
                  {resendMsg}
                </div>
              )}

              {errorMsg && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 py-2.5 px-3 text-sm text-red-700 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <PillButton
                type="submit"
                loading={isVerifyingOtp}
                className="w-full"
              >
                {authText.verifyOtpButton || "Xác minh OTP"}
              </PillButton>
            </form>

            <div className="mt-4 flex items-center justify-between text-xs text-secondary">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendingOtp}
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                {isResendingOtp && <RefreshCw className="h-3 w-3 animate-spin" />}
                {authText.resendOtp || "Gửi lại OTP"}
              </button>
              <Link to="/" className="font-semibold text-primary hover:underline">
                {authText.backToHome || "Back to Home"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
