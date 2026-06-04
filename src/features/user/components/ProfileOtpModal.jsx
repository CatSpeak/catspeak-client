import React, { useState, useEffect } from "react"
import { Hash, RefreshCw } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import TextInput from "@/shared/components/ui/inputs/TextInput"

const ProfileOtpModal = ({ open, onClose, email, onVerify, isVerifying, onResend, isResending, t }) => {
  const [otp, setOtp] = useState("")
  const [validationError, setValidationError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const profileText = t.profile?.personalInfo || {}
  const authText = t.auth || {}

  useEffect(() => {
    if (open) {
      setOtp("")
      setValidationError("")
      setSuccessMsg("")
      setErrorMsg("")
    }
  }, [open])

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError("")
    setErrorMsg("")
    setSuccessMsg("")

    const otpValue = otp.trim()
    if (!otpValue) {
      setValidationError(authText.validationOtpRequired || "Vui lòng nhập mã OTP!")
      return
    }
    if (otpValue.length !== 6) {
      setValidationError(authText.validationOtpLength || "Mã OTP phải có 6 chữ số")
      return
    }

    onVerify(otpValue, {
      setError: (msg) => setErrorMsg(msg),
      setSuccess: (msg) => setSuccessMsg(msg)
    })
  }

  const handleResend = async () => {
    setValidationError("")
    setErrorMsg("")
    setSuccessMsg("")
    try {
      await onResend()
      setSuccessMsg(authText.otpResentSuccess || "Mã OTP đã được gửi lại thành công")
    } catch (err) {
      setErrorMsg(err?.message || "Không thể gửi lại OTP.")
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="pb-6">
        <h2 className="mb-2 text-center text-3xl font-bold text-[#8f0d15]">
          {authText.verifyEmailTitle || "Xác minh Email"}
        </h2>
        <p className="mb-6 text-center text-sm text-[#7A7574]">
          {profileText.otpSentToEmail || "Chúng tôi đã gửi mã xác nhận 6 chữ số đến email của bạn"}{" "}
          {email && <strong className="text-black">{email}</strong>}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <TextInput
                type="text"
                variant="square"
                placeholder={authText.otpPlaceholder || "Nhập mã OTP 6 chữ số"}
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value)
                  setValidationError("")
                  setErrorMsg("")
                }}
                className={`pl-10 text-center text-lg tracking-widest ${
                  validationError ? "!border-red-600 focus:!border-red-600 focus:!ring-red-600" : ""
                }`}
              />
            </div>
            {validationError && <p className="mt-1 text-xs text-red-600">{validationError}</p>}
          </div>

          {errorMsg && (
            <p className="mb-4 rounded-lg bg-red-100 py-2 px-3 text-sm text-red-700">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="mb-4 rounded-lg bg-green-100 py-2 px-3 text-sm text-green-700">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#990011] hover:bg-[#80000e] text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 mb-4 h-10 flex items-center justify-center"
          >
            {isVerifying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              profileText.verifyAndSave || "Xác minh & Lưu"
            )}
          </button>

          <div className="text-center text-sm">
            <span className="text-[#7A7574]">
              {authText.didntReceiveCode || "Không nhận được mã?"}
            </span>{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-[#990011] hover:underline disabled:opacity-50 inline-flex items-center"
            >
              {isResending ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : null}
              {authText.resendOtp || "Gửi lại OTP"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ProfileOtpModal
