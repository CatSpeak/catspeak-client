import React, { useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  CreditCard,
  Info,
  Landmark,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import Dropdown from "@/shared/components/ui/Dropdown"
import {
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useRequestBankAccountOtpMutation,
  useConfirmBankAccountChangeMutation,
} from "@/features/bank-accounts/api/instructorBankAccountsApi"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"
import { maskAccountNumber } from "./utils"
import OtpCodeInput from "./contact/OtpCodeInput"
import useResendCountdown, {
  RESEND_COOLDOWN_SECONDS,
  formatCountdown,
} from "./contact/useResendCountdown"

const digitsOnly = (value) => String(value || "").replace(/\D/g, "")
const MIN_ACCOUNT_DIGITS = 6
const MAX_ACCOUNT_DIGITS = 20

/** Masks the middle of an account number, e.g. 1029384756 -> 1029••••56. */
const maskAccountMiddle = (value) => {
  const digits = String(value || "")
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 4)}••••${digits.slice(-2)}`
}

/** Mirrors the server's mask (first 3 + stars + last 2 — SRS BR-PRO-14/36). */
const maskPhone = (phone) => {
  const value = String(phone || "")
  if (!value) return ""
  if (value.length <= 4) return "*".repeat(value.length)
  return `${value.slice(0, 3)}${"*".repeat(
    Math.max(1, value.length - 5),
  )}${value.slice(-2)}`
}

const BankLogo = ({ logo, name, size = 24 }) => {
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-contain"
      />
    )
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#16864B] text-[10px] font-semibold text-white"
    >
      {String(name || "?").trim().charAt(0).toUpperCase()}
    </span>
  )
}

const SummaryRow = ({ icon, label, value }) => (
  <div className="flex h-[46px] items-center gap-2.5">
    {icon ? (
      <span className="flex shrink-0 items-center text-[#101828]">{icon}</span>
    ) : null}
    <span className="w-[165px] shrink-0 text-[11px] font-medium text-[#667085]">
      {label}
    </span>
    <span className="min-w-0 flex-1 break-words text-xs font-medium text-[#101828]">
      {value || "—"}
    </span>
  </div>
)

const Divider = () => <div className="h-px w-full bg-[#E4E7EC]" />

const BankAccountDrawer = ({ open, onClose, currentBank, currentPhone, t }) => {
  const ins = t.profile?.instructor || {}

  const [step, setStep] = useState("input")
  const [bankBin, setBankBin] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountError, setAccountError] = useState("")
  const [consent, setConsent] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [verified, setVerified] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [requiresNewCode, setRequiresNewCode] = useState(false)

  const { secondsLeft, isCoolingDown, start } = useResendCountdown()

  const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery()

  const [verifyBankAccount, { isLoading: isVerifying }] =
    useVerifyBankAccountMutation()
  const [requestBankAccountOtp, { isLoading: isRequesting }] =
    useRequestBankAccountOtpMutation()
  const [confirmBankAccountChange, { isLoading: isConfirming }] =
    useConfirmBankAccountChangeMutation()

  const bankOptions = useMemo(() => {
    const list = Array.isArray(banksData) ? banksData : []
    return list.map((bank) => ({
      value: bank.bin,
      label: bank.shortName || bank.code || bank.name,
      code: bank.code,
      logo: bank.logo,
      searchTerms: [bank.shortName, bank.code, bank.name, bank.bin]
        .filter(Boolean)
        .join(" "),
    }))
  }, [banksData])

  const selectedBank = useMemo(
    () => bankOptions.find((option) => option.value === bankBin) || null,
    [bankOptions, bankBin],
  )

  const currentAccountLabel = currentBank
    ? `${currentBank.bankShortName || ""} ${maskAccountNumber(
        currentBank.accountNumber,
      )}`.trim()
    : ""

  const accountDigits = digitsOnly(accountNumber)
  const accountIsValid =
    accountDigits.length >= MIN_ACCOUNT_DIGITS &&
    accountDigits.length <= MAX_ACCOUNT_DIGITS
  const clientAccountError =
    accountNumber !== "" && !accountIsValid
      ? ins.bankAccountNumberInvalid || "Số tài khoản phải có từ 6 đến 20 chữ số"
      : ""
  const shownAccountError = accountError || clientAccountError
  const canCheck = Boolean(bankBin) && accountIsValid
  const maskedCurrentPhone = maskPhone(currentPhone)

  const resolveBankError = (err, fallbackMessage, fallbackTarget) => {
    const { errorCode, message } = parseApiError(err)
    switch (errorCode) {
      case "BANK_ACCOUNT_VERIFICATION_FAILED":
        return { target: "account", message: ins.bankVerifyError || message }
      case "ACCOUNT_OTP_REQUIRED":
        return { target: "otp", message: ins.bankOtpRequired || message }
      case "ACCOUNT_INVALID_OTP":
        return { target: "otp", message: ins.bankOtpInvalid || message }
      case "ACCOUNT_OTP_TOO_MANY_ATTEMPTS":
        return {
          target: "otp",
          message: ins.bankOtpAttemptsExceeded || message,
          tooMany: true,
        }
      default:
        return { target: fallbackTarget, message: fallbackMessage || message }
    }
  }

  const handleCheck = async () => {
    if (!canCheck || isVerifying) return
    setAccountError("")
    try {
      const result = await verifyBankAccount({
        BankBin: bankBin,
        AccountNumber: accountDigits,
      }).unwrap()
      setVerified({
        bankBin: result.bankBin || bankBin,
        bankShortName:
          result.bankShortName || selectedBank?.label || "",
        bankFullName: result.bankFullName || "",
        accountNumber: result.accountNumber || accountDigits,
        accountHolderName: result.accountHolderName || "",
      })
      setConsent(false)
      setRequestError("")
      setStep("confirm")
    } catch (err) {
      const { message } = resolveBankError(
        err,
        ins.bankVerifyError || "Không thể xác thực tài khoản ngân hàng.",
        "account",
      )
      setAccountError(message)
    }
  }

  const requestOtp = async () => {
    const result = await requestBankAccountOtp({
      BankBin: verified?.bankBin,
      AccountNumber: verified?.accountNumber,
      IsDefault: true,
    }).unwrap()
    setChallenge({
      maskedPhone: result.maskedPhone || "",
      bankBin: result.bankBin || verified?.bankBin,
      bankShortName: result.bankShortName || verified?.bankShortName || "",
      accountNumber: result.accountNumber || verified?.accountNumber,
      accountHolderName:
        result.accountHolderName || verified?.accountHolderName || "",
    })
  }

  const handleRequestOtp = async () => {
    if (!consent || isRequesting) return
    setRequestError("")
    try {
      await requestOtp()
      setOtp("")
      setOtpError("")
      setRequiresNewCode(false)
      setStep("otp")
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { message } = resolveBankError(
        err,
        ins.bankRequestError || "Không thể gửi mã xác thực. Vui lòng thử lại.",
        "request",
      )
      setRequestError(message)
    }
  }

  const handleResend = async () => {
    if (isCoolingDown || isRequesting) return
    setOtpError("")
    try {
      await requestOtp()
      setOtp("")
      setRequiresNewCode(false)
      start(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const { message } = resolveBankError(
        err,
        ins.bankRequestError || "Không thể gửi mã xác thực. Vui lòng thử lại.",
        "otp",
      )
      setOtpError(message)
    }
  }

  const handleConfirm = async () => {
    if (otp.length !== 6 || isConfirming || requiresNewCode) return
    setOtpError("")
    try {
      await confirmBankAccountChange({
        BankBin: challenge?.bankBin || verified?.bankBin,
        AccountNumber: challenge?.accountNumber || verified?.accountNumber,
        IsDefault: true,
        OtpCode: otp,
      }).unwrap()
      toast.success(
        ins.bankUpdated || "Cập nhật tài khoản ngân hàng thành công",
      )
      onClose()
    } catch (err) {
      const { message, tooMany } = resolveBankError(
        err,
        ins.bankConfirmError ||
          "Không thể cập nhật tài khoản ngân hàng. Vui lòng thử lại.",
        "otp",
      )
      setOtpError(message)
      if (tooMany) setRequiresNewCode(true)
    }
  }

  const isConfirmStep = step === "confirm"
  const isOtpStep = step === "otp"

  const primaryLabel = isOtpStep
    ? ins.contactConfirm || "Xác nhận"
    : isConfirmStep
      ? ins.contactSendOtp || "Gửi mã xác thực"
      : ins.bankCheckAccount || "Kiểm tra tài khoản"

  const primaryDisabled = isOtpStep
    ? otp.length !== 6 || isConfirming || requiresNewCode
    : isConfirmStep
      ? !consent || isRequesting
      : !canCheck || isVerifying

  return (
    <ProfileDrawer
      open={open}
      onClose={onClose}
      title={
        isOtpStep
          ? ins.bankVerifyTitle || "Xác thực Tài khoản ngân hàng mới"
          : ins.bankChangeTitle || "Thay đổi Tài khoản ngân hàng"
      }
      secondaryLabel={ins.contactCancel || "Hủy"}
      onSecondary={onClose}
      primaryLabel={primaryLabel}
      onPrimary={
        isOtpStep ? handleConfirm : isConfirmStep ? handleRequestOtp : handleCheck
      }
      primaryDisabled={primaryDisabled}
    >
      {isOtpStep ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col rounded-lg border border-[#D0D5DD] p-4">
            <SummaryRow
              icon={<Landmark size={18} />}
              label={ins.bankLabel || "Ngân hàng"}
              value={challenge?.bankShortName}
            />
            <SummaryRow
              icon={<CreditCard size={18} />}
              label={ins.bankAccountNumber || "Số tài khoản"}
              value={maskAccountMiddle(challenge?.accountNumber)}
            />
            <SummaryRow
              icon={<User size={18} />}
              label={ins.bankAccountHolder || "Tên chủ tài khoản"}
              value={challenge?.accountHolderName}
            />
          </div>

          <p className="text-[10px] text-[#667085]">
            {ins.bankOtpHelper ||
              "Mã xác thực đã được gửi đến số điện thoại hiện tại đã xác thực của bạn theo mặc định."}
          </p>

          {challenge?.maskedPhone ? (
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="shrink-0 text-[#101828]" />
              <span className="text-[13px] font-semibold text-[#101828]">
                {challenge.maskedPhone}
              </span>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#101828]">
              {ins.bankOtpInputLabel || "Nhập mã xác thực (OTP)"}
            </span>
            <OtpCodeInput
              value={otp}
              onChange={(next) => {
                setOtp(next)
                setOtpError("")
              }}
              disabled={isConfirming}
              error={Boolean(otpError)}
              ariaLabel={ins.bankOtpInputLabel || "Nhập mã xác thực (OTP)"}
              describedBy={otpError ? "bank-otp-error" : undefined}
            />
            {otpError && (
              <p
                id="bank-otp-error"
                role="alert"
                className="text-xs text-red-500"
              >
                {otpError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCoolingDown && (
              <span className="text-[10px] text-[#667085]">
                {(
                  ins.contactResendCountdown || "Gửi lại mã sau {time}"
                ).replace("{time}", formatCountdown(secondsLeft))}
              </span>
            )}
            <span className="flex-1" />
            <button
              type="button"
              onClick={handleResend}
              disabled={isCoolingDown || isRequesting}
              className={`text-[11px] font-semibold transition-colors ${
                isCoolingDown
                  ? "cursor-not-allowed text-[#98A2B3]"
                  : "text-[#F52235] hover:underline"
              }`}
            >
              {ins.contactResend || "Gửi lại mã"}
            </button>
          </div>
        </div>
      ) : isConfirmStep ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-2.5 rounded-[7px] bg-[#FFF3F4] px-3.5 py-2.5">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0 text-[#F52235]"
            />
            <p className="text-[10px] font-semibold leading-4 text-[#F52235]">
              {ins.bankStep2Banner ||
                "Thông tin tài khoản mới đã được xác thực với ngân hàng. Vui lòng kiểm tra kỹ thông tin bên dưới trước khi gửi mã xác thực."}
            </p>
          </div>

          <span className="text-sm font-semibold text-[#101828]">
            {ins.bankCurrentAccount || "Tài khoản hiện tại"}
          </span>
          <div className="flex items-center gap-2.5 rounded-[7px] border border-[#D0D5DD] bg-[#F8FAFC] px-3.5 py-3.5">
            <Landmark size={20} className="shrink-0 text-[#101828]" />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#101828]">
              {currentAccountLabel || "—"}
            </span>
            <span className="shrink-0 rounded-[7px] bg-[#EFF4FF] px-3 py-1 text-[11px] font-semibold text-[#2E6FE8]">
              {ins.bankCurrentBadge || "Hiện tại"}
            </span>
          </div>

          <Divider />

          <span className="text-sm font-semibold text-[#101828]">
            {ins.bankVerifiedInfo || "Thông tin tài khoản mới (đã được xác thực)"}
          </span>
          <div className="flex flex-col rounded-lg border border-[#D0D5DD] px-4 py-3.5">
            <SummaryRow
              label={ins.bankLabel || "Ngân hàng"}
              value={verified?.bankShortName || selectedBank?.label}
            />
            <Divider />
            <SummaryRow
              label={ins.bankNewAccountNumber || "Số tài khoản mới"}
              value={verified?.accountNumber}
            />
            <Divider />
            <SummaryRow
              label={ins.bankAccountHolder || "Tên chủ tài khoản"}
              value={verified?.accountHolderName}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              className="sr-only"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked)
                setRequestError("")
              }}
            />
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                consent
                  ? "border-[#F52235] bg-[#F52235]"
                  : "border-[#D0D5DD] bg-white"
              }`}
            >
              {consent && (
                <Check size={13} strokeWidth={3} className="text-white" />
              )}
            </span>
            <span className="text-[10px] leading-4 text-[#101828]">
              {ins.bankConsent ||
                "Tôi xác nhận thông tin tài khoản trên là chính xác và đồng ý sử dụng tài khoản này để nhận thanh toán từ Cat Speak."}
            </span>
          </label>

          <div className="flex items-start gap-2.5 rounded-[7px] bg-[#EFF4FF] px-3 py-2.5">
            <Smartphone
              size={18}
              className="mt-0.5 shrink-0 text-[#101828]"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-[#667085]">
                {ins.bankOtpWillSendTo ||
                  "Mã xác thực (OTP) sẽ được gửi về số điện thoại đã xác thực của bạn:"}
              </span>
              <span className="text-[11px] font-semibold text-[#101828]">
                {maskedCurrentPhone || "—"}
              </span>
            </div>
          </div>

          {requestError && (
            <p role="alert" className="text-xs text-red-500">
              {requestError}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#101828]">
              {ins.bankCurrentAccount || "Tài khoản hiện tại"}
            </span>
            <div className="flex h-11 w-full items-center rounded-[7px] border border-[#D0D5DD] bg-[#F2F4F7] px-3.5 text-[13px] text-[#667085]">
              {currentAccountLabel || ins.bankNoAccount || "—"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#101828]">
              {ins.bankLabel || "Ngân hàng"}
            </span>
            <Dropdown
              className="w-full"
              options={bankOptions}
              value={bankBin}
              onChange={setBankBin}
              disabled={isVerifying}
              loading={isLoadingBanks}
              enableSearch
              searchPlaceholder={
                ins.bankSearchPlaceholder || "Tìm kiếm ngân hàng..."
              }
              maxHeightClass="max-h-[280px]"
              dropdownClassName="w-full min-w-full"
              renderOption={(option) => (
                <div className="flex w-full items-center gap-2.5 px-3 py-2">
                  <BankLogo logo={option.logo} name={option.label} />
                  <span className="truncate text-[13px] text-[#101828]">
                    {option.label}
                  </span>
                  <span className="ml-auto shrink-0 text-[11px] text-[#667085]">
                    {option.code}
                  </span>
                </div>
              )}
              trigger={(isOpen, selectedOption, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={isVerifying}
                  className="flex h-11 w-full items-center gap-2.5 rounded-[7px] border border-[#D0D5DD] bg-white px-3 text-[13px] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedOption ? (
                    <BankLogo
                      logo={selectedOption.logo}
                      name={selectedOption.label}
                    />
                  ) : null}
                  <span
                    className={`truncate ${
                      selectedOption ? "text-[#101828]" : "text-[#98A2B3]"
                    }`}
                  >
                    {selectedOption?.label ||
                      ins.bankSelectPlaceholder ||
                      "Chọn ngân hàng"}
                  </span>
                  <span className="flex-1" />
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#101828] transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#101828]">
              {ins.bankNewAccountNumber || "Số tài khoản mới"}
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={accountNumber}
              disabled={isVerifying}
              placeholder={
                ins.bankAccountNumberPlaceholder || "Nhập số tài khoản..."
              }
              onChange={(event) => {
                setAccountNumber(
                  digitsOnly(event.target.value).slice(0, MAX_ACCOUNT_DIGITS),
                )
                setAccountError("")
              }}
              className={`h-11 w-full rounded-[7px] border bg-white px-3.5 text-[13px] text-[#101828] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#990011] disabled:cursor-not-allowed disabled:opacity-60 ${
                shownAccountError ? "border-red-500" : "border-[#D0D5DD]"
              }`}
            />
            {shownAccountError && (
              <p role="alert" className="text-xs text-red-500">
                {shownAccountError}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-[7px] bg-[#EFF4FF] px-3.5 py-2.5">
            <Info size={18} className="mt-0.5 shrink-0 text-[#2E6FE8]" />
            <p className="text-[10px] leading-4 text-[#667085]">
              {ins.bankStep1Banner ||
                "Hệ thống sẽ kiểm tra thông tin tài khoản trước khi gửi mã xác thực đến bạn."}
            </p>
          </div>
        </div>
      )}
    </ProfileDrawer>
  )
}

export default BankAccountDrawer
