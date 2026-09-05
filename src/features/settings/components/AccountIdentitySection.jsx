import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Upload, Edit2 } from "lucide-react"
import { useUpdateIdentityDocumentsMutation } from "@/store/api/instructorApi"
import { useRequestUserProfileOtpMutation } from "@/store/api/userApi"
import ProfileOtpModal from "./ProfileOtpModal"

const MAX_ID_FILE_BYTES = 5 * 1024 * 1024
const ACCEPT_ID_IMAGE = "image/jpeg,image/png,image/webp"

const previewOf = (fileOrUrl) => {
  if (!fileOrUrl) return null
  if (typeof fileOrUrl === "string") return fileOrUrl
  return URL.createObjectURL(fileOrUrl)
}

/**
 * CCCD/ID-card block inside the security card (/setting/account).
 * Teacher accounts only. Shares the card-level edit button: boxes are
 * clickable only while the card is editing. Re-upload is OTP-gated
 * (email OTP) and resets admin ID verification on the live profile.
 */
const AccountIdentitySection = ({ frontUrl, backUrl, email, t, isEditing = false }) => {
  const idText = t.profile?.identity || {}
  const [front, setFront] = useState(frontUrl || null)
  const [back, setBack] = useState(backUrl || null)
  const [isOtpOpen, setIsOtpOpen] = useState(false)

  const [updateIdentity, { isLoading: isSaving }] = useUpdateIdentityDocumentsMutation()
  const [requestOtp, { isLoading: isSendingOtp }] = useRequestUserProfileOtpMutation()

  useEffect(() => {
    setFront(frontUrl || null)
  }, [frontUrl])
  useEffect(() => {
    setBack(backUrl || null)
  }, [backUrl])
  // Card-level cancel exits edit mode → drop unpicked file selections
  useEffect(() => {
    if (!isEditing) {
      setFront(frontUrl || null)
      setBack(backUrl || null)
    }
  }, [isEditing, frontUrl, backUrl])

  const hasNewFile = front instanceof File || back instanceof File

  const pickFile = (setter) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_ID_FILE_BYTES) {
      toast.error(idText.fileTooLarge || "Ảnh CCCD không được vượt quá 5 MB.")
      return
    }
    setter(file)
  }

  const handleCancel = () => {
    setFront(frontUrl || null)
    setBack(backUrl || null)
  }

  const handleSave = async () => {
    if (!hasNewFile || isSaving || isSendingOtp) return
    try {
      await requestOtp({}).unwrap()
      setIsOtpOpen(true)
    } catch (err) {
      toast.error(err?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.")
    }
  }

  const handleOtpVerify = async (otpValue, { setError }) => {
    try {
      const fd = new FormData()
      if (front instanceof File) fd.append("IdCardFront", front)
      if (back instanceof File) fd.append("IdCardBack", back)
      fd.append("OtpCode", otpValue)
      await updateIdentity(fd).unwrap()
      toast.success(idText.updateSuccess || "Đã cập nhật ảnh CCCD, chờ admin xác thực lại.")
      setIsOtpOpen(false)
    } catch (err) {
      const msg = err?.data?.message || ""
      if (msg.toLowerCase().includes("otp")) {
        setError(idText.otpInvalid || "Mã OTP không hợp lệ hoặc đã hết hạn")
      } else {
        setError(msg || "Có lỗi xảy ra, vui lòng thử lại.")
      }
    }
  }

  const renderBox = (label, value, setter, inputId) => {
    const preview = previewOf(value)
    return (
      <div className="flex flex-col gap-1 w-full max-w-[220px]">
        <label
          htmlFor={isEditing ? inputId : undefined}
          className={`relative flex flex-col items-center justify-center w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden group ${
            preview ? "border border-solid border-border shadow-sm" : "border-2 border-dashed border-gray-300"
          } ${isEditing ? "cursor-pointer hover:border-red-300 hover:bg-red-50/10 transition-colors" : ""}`}
        >
          {preview ? (
            <>
              <img src={preview} alt={label} className="w-full h-full object-cover" />
              {isEditing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                <Edit2 className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className={`w-6 h-6 transition-colors ${isEditing ? "text-gray-400 group-hover:text-red-500" : "text-gray-300"}`} />
              <span className={`text-[13px] font-medium transition-colors ${isEditing ? "text-gray-400 group-hover:text-red-500" : "text-gray-300"}`}>{label}</span>
            </div>
          )}
        </label>
        <input
          id={inputId}
          type="file"
          accept={ACCEPT_ID_IMAGE}
          className="hidden"
          disabled={!isEditing}
          onChange={pickFile(setter)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-semibold text-gray-800">
        {idText.title || "Căn cước công dân"}
      </label>

      <div className="flex flex-wrap gap-4">
        {renderBox(idText.front || "Mặt trước", front, setFront, "account-id-front")}
        {renderBox(idText.back || "Mặt sau", back, setBack, "account-id-back")}
      </div>

      <p className="text-[11px] text-gray-400">
        {idText.hint || "Đổi ảnh CCCD cần xác thực OTP qua email. Ảnh mới cần admin xác thực lại."}
      </p>

      {isEditing && hasNewFile && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={isSaving || isSendingOtp}
          >
            {t.profile?.personalInfo?.cancel || "Hủy"}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-full bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={isSaving || isSendingOtp}
          >
            {isSendingOtp ? (t.profile?.personalInfo?.sendingOtp || "Đang gửi OTP...") : (idText.saveImages || "Lưu ảnh CCCD")}
          </button>
        </div>
      )}

      <ProfileOtpModal
        open={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        email={email}
        title={idText.verifyTitle || "Xác nhận đổi ảnh CCCD"}
        onVerify={handleOtpVerify}
        isVerifying={isSaving}
        onResend={() => requestOtp({}).unwrap()}
        isResending={isSendingOtp}
        t={t}
      />
    </div>
  )
}

export default AccountIdentitySection
