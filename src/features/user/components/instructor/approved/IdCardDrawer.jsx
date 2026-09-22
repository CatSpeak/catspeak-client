import React, { useEffect, useMemo, useState } from "react"
import { ImageOff, UploadCloud } from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import { useUpdateInstructorIdCardMutation } from "@/store/api/instructorApi"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"

const ID_CARD_MAX_BYTES = 5 * 1024 * 1024
const ID_CARD_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]

const extensionOf = (name) => {
  const parts = String(name || "").toLowerCase().split(".")
  return parts.length > 1 ? parts.pop() : ""
}

const formatFileSize = (bytes) => {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return ""
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const magicTypeOf = async (file) => {
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (bytes.length < 4) return null
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "jpeg"
    }
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "png"
    }
    const tag = (start, end) => String.fromCharCode(...bytes.slice(start, end))
    if (bytes.length >= 12 && tag(0, 4) === "RIFF" && tag(8, 12) === "WEBP") {
      return "webp"
    }
    return null
  } catch {
    return null
  }
}

/**
 * Validates a CCCD image against the server rules: allowed extension, max 5MB
 * and a real image signature (magic bytes). Returns an i18n error key or "".
 */
const validateIdCardFile = async (file) => {
  const extension = extensionOf(file?.name)
  if (!ID_CARD_EXTENSIONS.includes(extension)) return "idCardFileType"
  if (file.size > ID_CARD_MAX_BYTES) return "idCardFileSize"

  const magic = await magicTypeOf(file)
  const expected = extension === "jpg" ? "jpeg" : extension
  if (!magic || magic !== expected) return "idCardFileInvalid"
  return ""
}

const FileThumbnail = ({ file }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return (
    <img src={url} alt={file.name} className="h-full w-full object-cover" />
  )
}

const CurrentImage = ({ label, url }) => (
  <div className="flex min-w-0 flex-1 flex-col gap-1">
    <span className="text-[11px] text-[#101828]">{label}</span>
    <div className="flex h-[94px] w-full items-center justify-center overflow-hidden rounded-lg border border-[#D0D5DD] bg-[#F2F4F7]">
      {url ? (
        <img src={url} alt={label} className="h-full w-full object-cover" />
      ) : (
        <ImageOff size={24} className="text-[#98A2B3]" />
      )}
    </div>
  </div>
)

const IdCardDrawer = ({
  open,
  onClose,
  currentFrontUrl,
  currentBackUrl,
  onUpdated,
  t,
}) => {
  const ins = t.profile?.instructor || {}

  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [errors, setErrors] = useState({ front: "", back: "" })
  const [dragOver, setDragOver] = useState(null)
  const [submitError, setSubmitError] = useState("")

  const [updateIdCard, { isLoading }] = useUpdateInstructorIdCardMutation()

  const canSubmit = Boolean(frontFile) && Boolean(backFile) && !isLoading

  const applyFile = async (side, file) => {
    if (!file) return
    const errorKey = await validateIdCardFile(file)
    if (errorKey) {
      setErrors((prev) => ({ ...prev, [side]: ins[errorKey] || "" }))
      return
    }
    setErrors((prev) => ({ ...prev, [side]: "" }))
    setSubmitError("")
    if (side === "front") setFrontFile(file)
    else setBackFile(file)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitError("")
    const formData = new FormData()
    formData.append("IdCardFront", frontFile)
    formData.append("IdCardBack", backFile)
    try {
      await updateIdCard(formData).unwrap()
      toast.success(ins.idCardUpdatedToast || "Cập nhật ảnh CCCD thành công")
      onUpdated?.()
      onClose?.()
    } catch (err) {
      const { message } = parseApiError(err)
      setSubmitError(
        ins.idCardUpdateError ||
          message ||
          "Không thể cập nhật ảnh CCCD. Vui lòng thử lại.",
      )
    }
  }

  const renderField = (side, label, file) => {
    const inputId = `id-card-${side}-input`
    const error = errors[side]

    return (
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-[#101828]">{label}</span>

        {file ? (
          <label
            htmlFor={inputId}
            className="flex w-[220px] cursor-pointer flex-col gap-1"
          >
            <div className="h-[120px] w-[220px] overflow-hidden rounded-lg border border-[#D0D5DD] bg-[#F2F4F7]">
              <FileThumbnail file={file} />
            </div>
            <span className="truncate text-[11px] text-[#101828]">
              {file.name}
            </span>
            <span className="text-[10px] text-[#667085]">
              {formatFileSize(file.size)}
            </span>
          </label>
        ) : (
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOver(side)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(event) => {
              event.preventDefault()
              setDragOver(null)
              applyFile(side, event.dataTransfer?.files?.[0])
            }}
            className={`flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed bg-white text-center transition-colors ${
              error
                ? "border-red-400"
                : dragOver === side
                  ? "border-[#990011] bg-[#990011]/5"
                  : "border-[#D0D5DD] hover:border-[#990011] hover:bg-[#990011]/5"
            }`}
          >
            <UploadCloud size={25} className="text-[#667085]" />
            <span className="text-xs text-[#667085]">
              {ins.idCardDropHint || "Kéo thả hoặc"}
            </span>
            <span className="text-xs font-semibold text-[#F52235]">
              {ins.idCardChooseFile || "Chọn tệp"}
            </span>
            <span className="text-[10px] text-[#667085]">
              {ins.idCardConstraint || "JPG, PNG tối đa 5MB"}
            </span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            event.target.value = ""
            if (picked) applyFile(side, picked)
          }}
        />

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <ProfileDrawer
      open={open}
      onClose={onClose}
      title={ins.idCardDrawerTitle || "Cập nhật CCCD"}
      secondaryLabel={ins.contactCancel || "Hủy"}
      onSecondary={onClose}
      primaryLabel={ins.idCardSubmit || "Gửi xác thực"}
      onPrimary={handleSubmit}
      primaryDisabled={!canSubmit}
    >
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-[#101828]">
          {ins.idCardCurrentInfo || "Thông tin hiện tại"}
        </span>
        <div className="flex gap-4">
          <CurrentImage label={ins.idFront || "Mặt trước"} url={currentFrontUrl} />
          <CurrentImage label={ins.idBack || "Mặt sau"} url={currentBackUrl} />
        </div>

        <span className="mt-1 text-sm font-semibold text-[#101828]">
          {ins.idCardWantedInfo || "Thông tin muốn cập nhật"}
        </span>
        {renderField("front", ins.idCardFrontNew || "Mặt trước mới", frontFile)}
        {renderField("back", ins.idCardBackNew || "Mặt sau mới", backFile)}

        {submitError && (
          <p role="alert" className="text-xs text-red-500">
            {submitError}
          </p>
        )}
      </div>
    </ProfileDrawer>
  )
}

export default IdCardDrawer
