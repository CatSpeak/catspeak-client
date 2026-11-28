import React, { useId, useState } from "react"
import { UploadCloud, X } from "lucide-react"
import { formatBytes, validateCertificateFile } from "./utils"

/**
 * Single-PDF certificate field: dashed-less dropzone when empty, a file card
 * with a PDF tag and an X remove icon once a valid file is picked. Owns its
 * validation (extension + size + magic bytes) and reports the accepted File up.
 */
const CertificateField = ({ onChange, t }) => {
  const ins = t.profile?.instructor || {}
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputId = useId()

  const applyFile = async (picked) => {
    if (!picked) return
    const errorKey = await validateCertificateFile(picked)
    if (errorKey) {
      setError(ins[errorKey] || "")
      return
    }
    setError("")
    setFile(picked)
    onChange?.(picked)
  }

  const clear = () => {
    setFile(null)
    setError("")
    onChange?.(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {file ? (
        <div className="flex h-[58px] items-center gap-2.5 rounded-[7px] border border-[#D0D5DD] bg-white px-3 dark:border-[#3F3F3F] dark:bg-[#242424]">
          <span className="flex h-8 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#D0D5DD] bg-[#FFF1F2] text-[7px] font-bold text-[#F52235] dark:border-[#3F3F3F] dark:bg-rose-950/50 dark:text-rose-300">
            PDF
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-xs font-medium text-[#101828] dark:text-white">
              {file.name}
            </span>
            <span className="text-[10px] text-[#667085] dark:text-neutral-400">
              {formatBytes(file.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={clear}
            aria-label={ins.remove || "Xóa"}
            className="shrink-0 text-[#101828] transition-colors hover:text-[#F52235] dark:text-neutral-200 dark:hover:text-rose-400"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            applyFile(event.dataTransfer?.files?.[0])
          }}
          className={`flex h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border bg-white text-center transition-colors dark:bg-[#242424] ${
            error
              ? "border-red-400"
              : dragOver
                ? "border-[#990011] bg-[#990011]/5"
                : "border-[#D0D5DD] hover:border-[#990011] hover:bg-[#990011]/5 dark:border-[#3F3F3F] dark:hover:border-red-400 dark:hover:bg-red-950/20"
          }`}
        >
          <UploadCloud size={25} className="text-[#667085] dark:text-neutral-300" />
          <span className="text-xs text-[#667085] dark:text-neutral-300">
            {ins.idCardDropHint || "Kéo thả hoặc"}
          </span>
          <span className="text-xs font-semibold text-[#D92D20] dark:text-red-400">
            {ins.idCardChooseFile || "Chọn tệp"}
          </span>
          <span className="text-[10px] text-[#667085] dark:text-neutral-300">
            {ins.languageCertificateConstraint || "PDF tối đa 5MB"}
          </span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(event) => {
          const picked = event.target.files?.[0]
          event.target.value = ""
          if (picked) applyFile(picked)
        }}
      />

      {error && (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default CertificateField
