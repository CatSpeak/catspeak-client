import React, { useState } from "react"
import { Info } from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import {
  useRequestEmailChangeOtpMutation,
  useConfirmEmailChangeMutation,
} from "@/store/api/userApi"
import { toast } from "@/shared/utils/toastBridge"
import OtpCodeInput from "./OtpCodeInput"
import useResendCountdown, {
  RESEND_COOLDOWN_SECONDS,
  formatCountdown,
} from "./useResendCountdown"
import { resolveContactError } from "./contactErrors"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const readonlyFieldClass =
  "flex h-11 w-full items-center rounded-[7px] border border-[#D0D5DD] bg-[#F9FAFB] px-3.5 text-[13px] text-[#667085]"

const ContactHelper = ({ children }) => (
  <div className="flex items-center gap-2">
    <Info size={15} className="shrink-0 text-[#667085]" />
    <span className="text-[10px] font-normal text-[#667085]">{children}</span>
  </div>
)

const ChangeEmailDrawer = ({ open, onClose, currentEmail, t }) => {
  const ins = t.profile?.instructor || {}
  const profileText = t.profile?.personalInfo || {}

  const [step, setStep] = useState("form")
  const [newEmail, setNewEmail] = useState("")
  const [pendingEmail, setPendingEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [valueError, setValueError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [requiresNewCode, setRequiresNewCode] = useState(false)

  const { secondsLeft, isCoolingDown, start } = useResendCountdown()

  const [requestOtp, { isLoading: isRequesting }] =
    useRequestEmailChangeOtpMutation()
  const [confirmChange, { isLoading: isConfirming }] =
    useConfirmEmailChangeMutation()

  const trimmedEmail = newEmail.trim()
  const sameAsCurrent =
    trimmedEmail !== "" &&
    trimmedEmail.toLowerCase() === String(currentEmail || "").trim().toLowerCase()

  const clientValueError = (() => {
    if (!trimmedEmail) return ""
    if (trimmedEmail.length > 254 || !EMAIL_PATTERN.test(trimmedEmail)) {
      return ins.contactEmailInvalid || "Email không đúng định dạng"
    }
    if (sameAsCurrent) {
      return ins.contactEmailSame || "Email mới phải khác email hiện tại"
    }
    return ""
  })()

  const canSend = trimmedEmail !== "" && !clientValueError
  const shownValueError = valueError || clientValueError

  const handleRequest = async () => {
    if (!canSend || isRequesting) return
    setValueError("")
    try {
      await requestOtp({ NewEmail: trimmedEmail }).unwrap()
      setPendingEmail(trimmedEmail)
      setStep("verify")
      setOtp("")
      setOtpError("")
      setRequiresNewCode(false)
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { target, message } = resolveContactError(err, ins, {
        field: "email",
        fallback: ins.contactRequestError,
      })
      if (target === "otp") setOtpError(message)
      else setValueError(message)
    }
  }

  const handleResend = async () => {
    if (isCoolingDown) return
    setOtpError("")
    try {
      await requestOtp({ NewEmail: pendingEmail }).unwrap()
      setOtp("")
      setRequiresNewCode(false)
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { target, message } = resolveContactError(err, ins, {
        field: "email",
        fallback: ins.contactRequestError,
      })
      if (target === "otp") setOtpError(message)
      else setValueError(message)
    }
  }

  const handleConfirm = async () => {
    if (otp.length !== 6 || isConfirming || requiresNewCode) return
    setOtpError("")
    setValueError("")
    try {
      await confirmChange({ NewEmail: pendingEmail, OtpCode: otp }).unwrap()
      toast.success(ins.contactEmailUpdated || "Cập nhật email thành công")
      onClose()
    } catch (err) {
      const { target, message, errorCode } = resolveContactError(err, ins, {
        field: "email",
        fallback: ins.contactConfirmError,
      })
      if (target === "otp") {
        setOtpError(message)
        if (errorCode === "ACCOUNT_OTP_TOO_MANY_ATTEMPTS") {
          setRequiresNewCode(true)
        }
      } else {
        setValueError(message)
      }
    }
  }

  const isVerifyStep = step === "verify"

  return (
    <ProfileDrawer
      open={open}
      onClose={onClose}
      title={
        isVerifyStep
          ? ins.contactVerifyEmailTitle || "Xác thực Email mới"
          : ins.contactChangeEmailTitle || "Thay đổi Email"
      }
      secondaryLabel={ins.contactCancel || "Hủy"}
      onSecondary={onClose}
      primaryLabel={
        isVerifyStep
          ? ins.contactConfirm || "Xác nhận"
          : ins.contactSendOtp || "Gửi mã xác thực"
      }
      onPrimary={isVerifyStep ? handleConfirm : handleRequest}
      primaryDisabled={
        isVerifyStep
          ? otp.length !== 6 || isConfirming || requiresNewCode
          : !canSend || isRequesting
      }
    >
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.contactCurrentEmail || "Email hiện tại"}
          </span>
          <div className={readonlyFieldClass}>{currentEmail || "—"}</div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.contactNewEmail || "Email mới"}
          </span>
          {isVerifyStep ? (
            <>
              <div className={readonlyFieldClass}>{pendingEmail}</div>
              {valueError && (
                <p className="text-xs text-red-500">{valueError}</p>
              )}
            </>
          ) : (
            <>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={newEmail}
                disabled={isRequesting}
                placeholder={profileText.enterEmail || "Nhập địa chỉ email..."}
                onChange={(event) => {
                  setNewEmail(event.target.value)
                  setValueError("")
                }}
                className={`h-11 w-full rounded-[7px] border bg-white px-3.5 text-[13px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#990011] disabled:cursor-not-allowed disabled:opacity-60 ${
                  shownValueError ? "border-red-500" : "border-[#D0D5DD]"
                }`}
              />
              {shownValueError && (
                <p className="text-xs text-red-500">{shownValueError}</p>
              )}
            </>
          )}
        </div>

        {isVerifyStep ? (
          <>
            <ContactHelper>
              {(ins.contactOtpSentTo || "Mã xác thực đã được gửi đến {value}.").replace(
                "{value}",
                pendingEmail,
              )}
            </ContactHelper>

            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[#101828]">
                {ins.contactOtpLabel || "Nhập mã xác thực"}
              </span>
              <OtpCodeInput
                value={otp}
                onChange={(next) => {
                  setOtp(next)
                  setOtpError("")
                }}
                disabled={isConfirming}
                error={Boolean(otpError)}
                ariaLabel={ins.contactOtpLabel || "Nhập mã xác thực"}
                describedBy={otpError ? "contact-otp-error" : undefined}
              />
              {otpError && (
                <p id="contact-otp-error" role="alert" className="text-xs text-red-500">
                  {otpError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {isCoolingDown && (
                <span className="text-[10px] text-[#667085]">
                  {(
                    ins.contactResendCountdown || "Gửi lại mã sau {time}"
                  ).replace("{time}", formatCountdown(secondsLeft))}
                </span>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={isCoolingDown || isRequesting}
                className={`self-start text-[11px] font-semibold transition-colors ${
                  isCoolingDown
                    ? "cursor-not-allowed text-[#98A2B3]"
                    : "text-[#F52235] hover:underline"
                }`}
              >
                {ins.contactResend || "Gửi lại mã"}
              </button>
            </div>
          </>
        ) : (
          <ContactHelper>
            {ins.contactEmailHelper ||
              "Email mới sẽ cần được xác thực trước khi áp dụng."}
          </ContactHelper>
        )}
      </div>
    </ProfileDrawer>
  )
}

export default ChangeEmailDrawer
