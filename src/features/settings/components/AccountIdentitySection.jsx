import React from "react"
import { toast } from "react-hot-toast"
import { Upload, Edit2 } from "lucide-react"

const MAX_ID_FILE_BYTES = 5 * 1024 * 1024
const ACCEPT_ID_IMAGE = "image/jpeg,image/png,image/webp"

const previewOf = (fileOrUrl) => {
  if (!fileOrUrl) return null
  if (typeof fileOrUrl === "string") return fileOrUrl
  return URL.createObjectURL(fileOrUrl)
}

/**
 * CCCD/ID-card block inside the security card (/setting/account).
 * Teacher accounts only. Controlled component: file picks live in the page,
 * saving goes through the card-level Save button (OTP-gated in the mutation
 * hook). Boxes are clickable only while the card is editing.
 */
const AccountIdentitySection = ({
  frontFile,
  backFile,
  frontUrl,
  backUrl,
  t,
  isEditing = false,
  onPickFile,
}) => {
  const idText = t.profile?.identity || {}

  const pickFile = (side) => (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > MAX_ID_FILE_BYTES) {
      toast.error(idText.fileTooLarge || "Ảnh CCCD không được vượt quá 5 MB.")
      return
    }
    onPickFile?.(side, file)
  }

  const renderBox = (label, file, url, side, inputId) => {
    const preview = previewOf(file || url)
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
          onChange={pickFile(side)}
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
        {renderBox(idText.front || "Mặt trước", frontFile, frontUrl, "front", "account-id-front")}
        {renderBox(idText.back || "Mặt sau", backFile, backUrl, "back", "account-id-back")}
      </div>

      <p className="text-[11px] text-gray-400">
        {idText.hint || "Đổi ảnh CCCD cần xác thực OTP qua email. Ảnh mới cần admin xác thực lại."}
      </p>
    </div>
  )
}

export default AccountIdentitySection
