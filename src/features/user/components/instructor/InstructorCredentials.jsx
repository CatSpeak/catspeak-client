import React, { useMemo, useState, useEffect } from "react"
import { Plus, X, ExternalLink, Download } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { FileText } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Modal from "@/shared/components/ui/Modal"
import FilePreview from "@/shared/components/ui/FilePreview"

/**
 * Extract the original filename from a stored credential URL.
 * Storage renames uploads to "{GUID}_{originalName}", so the original name is
 * the last path segment after the GUID prefix.
 */
function fileNameFromUrl(url) {
  if (!url || typeof url !== "string") return ""
  try {
    const clean = url.split(/[?#]/)[0]
    const last = clean.split("/").filter(Boolean).pop() || ""
    const idx = last.indexOf("_")
    return idx >= 0 ? last.slice(idx + 1) : last
  } catch {
    return ""
  }
}

const InstructorCredentials = ({ formData, onAddCredential, onRemoveCredential, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

  // Spec Q8/Q11: click a credential row (view + edit) opens a PDF preview modal.
  const [previewIndex, setPreviewIndex] = useState(null)

  const credentials = formData.credentials || []
  // Clamp without setState-in-effect: an out-of-range index simply shows no preview.
  const safePreviewIndex =
    previewIndex != null && previewIndex < credentials.length ? previewIndex : null
  const previewCred = safePreviewIndex != null ? credentials[safePreviewIndex] : null

  // File objects (newly picked, not yet saved) need an object URL. Created in
  // memo, revoked on cleanup — no setState inside effects.
  const fileObjectUrl = useMemo(
    () => (previewCred instanceof File ? URL.createObjectURL(previewCred) : null),
    [previewCred],
  )
  useEffect(
    () => () => {
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl)
    },
    [fileObjectUrl],
  )

  const displayName = (cred, idx) => {
    if (cred instanceof File) return cred.name
    const parsed = fileNameFromUrl(cred)
    return parsed || `${ins.document || "Tài liệu"} ${idx + 1}`
  }

  const previewUrl = previewCred instanceof File ? fileObjectUrl : previewCred
  const previewName = previewCred != null ? displayName(previewCred, safePreviewIndex) : ""

  const handleOpenNewTab = () => {
    if (previewUrl) window.open(previewUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <FluentCard id="field-credentials" className="gap-6 !justify-start h-full min-h-[320px] flex-col flex">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {ins.uploadCredentials || "Chứng chỉ"}
        </h2>
        {!readOnly && (
          <PillButton
            onClick={onAddCredential}
            startIcon={<Plus className="w-4 h-4" />}
            className="!h-9 !px-4"
          >
            {ins.addCredential || "Thêm chứng chỉ"}
          </PillButton>
        )}
      </div>

      <p className="text-[11px] text-cath-red-700">
        {ins.credentialsNote || "Bạn phải cung cấp bằng chứng hoặc chứng chỉ phù hợp với trình độ đã chọn ở trên. Tệp tải lên phải ở định dạng PDF, rõ ràng và chi tiết, mỗi tệp dưới 100MB. NGHIÊM CẤM: Mọi hình thức chứng chỉ giả mạo."}
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {(!formData.credentials || formData.credentials.length === 0) && (
          <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <div className={`flex flex-col items-center justify-center w-full h-[72px] bg-white border-2 border-dashed rounded-xl ${errors.credentials ? "border-red-500 bg-red-50/10" : "border-border"} text-gray-400`}>
              <span className={`text-[13px] ${errors.credentials ? "text-red-500" : "text-gray-400"}`}>{ins.noCredentials || "Chưa có chứng chỉ"}</span>
            </div>
            {errors.credentials && <p className="text-xs text-red-500">{errors.credentials}</p>}
          </div>
        )}
        {formData.credentials && formData.credentials.map((cred, idx) => (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            title={ins.previewCredential || "Bấm để xem chứng chỉ"}
            onClick={() => setPreviewIndex(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setPreviewIndex(idx)
              }
            }}
            className="relative flex items-center gap-3 w-full sm:w-[320px] p-3 bg-white border border-border rounded-xl group hover:border-red-200 hover:bg-red-50/30 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-700 truncate" title={displayName(cred, idx)}>
                {displayName(cred, idx)}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {typeof cred === "string" ? (ins.attachedFile || "Tệp đính kèm") : (ins.pdfDocument || "Tài liệu PDF")}
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveCredential && onRemoveCredential(idx)
                }}
                onKeyDown={(e) => {
                  // Prevent parent row keydown (Enter/Space opens preview)
                  // when the delete button itself is activated via keyboard.
                  e.stopPropagation()
                }}
                className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={ins.remove || "Xóa"}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Spec Q11: PDF preview modal — iframe + open-new-tab + download + Esc/backdrop close */}
      <Modal
        open={safePreviewIndex != null}
        onClose={() => setPreviewIndex(null)}
        title={
          <h2 className="text-[16px] leading-[22px] font-semibold truncate flex-1 min-w-0 mr-2" title={previewName}>
            {previewName}
          </h2>
        }
        className="w-full h-full md:w-[90vw] md:max-w-5xl md:h-[90vh]"
        bodyClassName="p-0 flex-1 overflow-hidden bg-[#F3F3F3] flex flex-col"
        headerClassName="flex items-center justify-between gap-2 p-4 border-b bg-white"
        footerClassName="p-3 sm:p-4 border-t bg-white"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                download={previewName || true}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-border rounded-lg transition"
              >
                <Download size={15} />
                <span>{ins.download || "Tải xuống"}</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleOpenNewTab}
              disabled={!previewUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#990011] hover:bg-[#7a000e] rounded-lg transition disabled:opacity-50"
            >
              <ExternalLink size={15} />
              <span>{ins.openNewTab || "Mở tab mới"}</span>
            </button>
          </div>
        }
      >
        {previewUrl ? (
          <FilePreview url={previewUrl} fileName={previewName} className="w-full h-full min-h-[50vh]" />
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[50vh] text-sm text-gray-500">
            {ins.previewLoading || "Đang tải xem trước..."}
          </div>
        )}
      </Modal>
    </FluentCard>
  )
}

export default InstructorCredentials
