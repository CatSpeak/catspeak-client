import React, { useState } from "react"
import { ChevronDown, Info } from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import Dropdown from "@/shared/components/ui/Dropdown"
import { parsePhoneData, phonePrefixes } from "@/shared/constants/countriesOptions"
import {
  useRequestPhoneChangeOtpMutation,
  useConfirmPhoneChangeMutation,
} from "@/store/api/userApi"
import { toast } from "@/shared/utils/toastBridge"
import OtpCodeInput from "./OtpCodeInput"
import useResendCountdown, {
  RESEND_COOLDOWN_SECONDS,
  formatCountdown,
} from "./useResendCountdown"
import { resolveContactError } from "./contactErrors"

const readonlyFieldClass =
  "flex h-11 w-full items-center rounded-[7px] border border-[#D0D5DD] bg-[#F9FAFB] px-3.5 text-[13px] text-[#667085]"

const ContactHelper = ({ children }) => (
  <div className="flex items-center gap-2">
    <Info size={15} className="shrink-0 text-[#667085]" />
    <span className="text-[10px] font-normal text-[#667085]">{children}</span>
  </div>
)

const digitsOnly = (value) => String(value || "").replace(/\D/g, "")

const buildE164 = (prefix, local) =>
  `${prefix}${digitsOnly(local).replace(/^0+/, "")}`

const ChangePhoneDrawer = ({ open, onClose, currentPhone, t }) => {
  const ins = t.profile?.instructor || {}
  const profileText = t.profile?.personalInfo || {}

  const [step, setStep] = useState("form")
  const [prefix, setPrefix] = useState(
    () => parsePhoneData(currentPhone).phonePrefix || "+84",
  )
  const [local, setLocal] = useState("")
  const [pendingPhone, setPendingPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [valueError, setValueError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [requiresNewCode, setRequiresNewCode] = useState(false)

  const { secondsLeft, isCoolingDown, start } = useResendCountdown()

  const [requestOtp, { isLoading: isRequesting }] =
    useRequestPhoneChangeOtpMutation()
  const [confirmChange, { isLoading: isConfirming }] =
    useConfirmPhoneChangeMutation()

  const currentParsed = parsePhoneData(currentPhone)
  const currentE164 =
    currentPhone && digitsOnly(currentPhone)
      ? buildE164(currentParsed.phonePrefix, currentParsed.phoneNumber)
      : ""

  const newE164 = local ? buildE164(prefix, local) : ""
  const totalDigits = digitsOnly(newE164).length
  const sameAsCurrent =
    newE164 !== "" &&
    newE164.toLowerCase() === currentE164.toLowerCase()

  const clientValueError = (() => {
    if (!local) return ""
    if (totalDigits < 7 || totalDigits > 15) {
      return ins.contactPhoneInvalid || "Số điện thoại không hợp lệ"
    }
    if (sameAsCurrent) {
      return ins.contactPhoneSame || "Số điện thoại mới phải khác số hiện tại"
    }
    return ""
  })()

  const canSend = local !== "" && !clientValueError
  const shownValueError = valueError || clientValueError

  const handleRequest = async () => {
    if (!canSend || isRequesting) return
    setValueError("")
    try {
      await requestOtp({ PhoneNumber: newE164 }).unwrap()
      setPendingPhone(newE164)
      setStep("verify")
      setOtp("")
      setOtpError("")
      setRequiresNewCode(false)
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { target, message } = resolveContactError(err, ins, {
        field: "phone",
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
      await requestOtp({ PhoneNumber: pendingPhone }).unwrap()
      setOtp("")
      setRequiresNewCode(false)
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { target, message } = resolveContactError(err, ins, {
        field: "phone",
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
      await confirmChange({ PhoneNumber: pendingPhone, OtpCode: otp }).unwrap()
      toast.success(
        ins.contactPhoneUpdated || "Cập nhật số điện thoại thành công",
      )
      onClose()
    } catch (err) {
      const { target, message, errorCode } = resolveContactError(err, ins, {
        field: "phone",
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
          ? ins.contactVerifyPhoneTitle || "Xác thực Số điện thoại mới"
          : ins.contactChangePhoneTitle || "Thay đổi Số điện thoại"
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
            {ins.contactCurrentPhone || "Số điện thoại hiện tại"}
          </span>
          <div className={readonlyFieldClass}>{currentPhone || "—"}</div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#101828]">
            {ins.contactNewPhone || "Số điện thoại mới"}
          </span>
          {isVerifyStep ? (
            <>
              <div className={readonlyFieldClass}>{pendingPhone}</div>
              {valueError && (
                <p className="text-xs text-red-500">{valueError}</p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <Dropdown
                  options={phonePrefixes}
                  value={prefix}
                  onChange={setPrefix}
                  disabled={isRequesting}
                  enableSearch
                  searchPlaceholder={
                    profileText.searchPhoneCode || "Tìm kiếm mã vùng..."
                  }
                  dropdownClassName="w-[300px]"
                  trigger={(isOpen, selectedOption, toggle) => (
                    <button
                      type="button"
                      onClick={toggle}
                      disabled={isRequesting}
                      className={`flex h-11 w-[90px] shrink-0 items-center justify-between gap-2 rounded-[7px] border bg-white px-2.5 text-xs text-[#101828] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60 ${
                        shownValueError ? "border-red-500" : "border-[#D0D5DD]"
                      }`}
                    >
                      {selectedOption?.icon}
                      <span className="truncate">{prefix}</span>
                      <ChevronDown
                        size={12}
                        className={`shrink-0 text-[#667085] transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={local}
                  disabled={isRequesting}
                  placeholder={
                    profileText.enterPhoneNumber || "Nhập số điện thoại..."
                  }
                  onChange={(event) => {
                    setLocal(digitsOnly(event.target.value))
                    setValueError("")
                  }}
                  className={`h-11 min-w-0 flex-1 rounded-[7px] border bg-white px-3 text-[13px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#990011] disabled:cursor-not-allowed disabled:opacity-60 ${
                    shownValueError ? "border-red-500" : "border-[#D0D5DD]"
                  }`}
                />
              </div>
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
                pendingPhone,
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
                describedBy={otpError ? "contact-phone-otp-error" : undefined}
              />
              {otpError && (
                <p
                  id="contact-phone-otp-error"
                  role="alert"
                  className="text-xs text-red-500"
                >
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
            {ins.contactPhoneHelper ||
              "Số điện thoại mới sẽ cần được xác thực trước khi áp dụng."}
          </ContactHelper>
        )}
      </div>
    </ProfileDrawer>
  )
}

export default ChangePhoneDrawer
