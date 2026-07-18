import React from "react"
import { Plus, X } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { FileText, ImageIcon } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

const InstructorCredentials = ({ formData, onAddCredential, onRemoveCredential, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

  return (
    <FluentCard id="field-credentials" className="gap-6 !justify-start">
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
        {ins.credentialsNote || "Bạn phải cung cấp bằng chứng hoặc chứng chỉ phù hợp với trình độ đã chọn ở trên. Tệp tải lên phải ở định dạng PDF, rõ ràng và chi tiết. NGHIÊM CẤM: Mọi hình thức chứng chỉ giả mạo."}
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {(!formData.credentials || formData.credentials.length === 0) && (
          <div className="flex flex-col gap-1 w-full max-w-[320px]">
            <div className={`flex flex-col items-center justify-center w-full h-[72px] bg-white border-2 border-dashed rounded-xl ${errors.credentials ? "border-red-500 bg-red-50/10" : "border-gray-200"} text-gray-400`}>
              <span className={`text-[13px] ${errors.credentials ? "text-red-500" : "text-gray-400"}`}>{ins.noCredentials || "Chưa có chứng chỉ"}</span>
            </div>
            {errors.credentials && <p className="text-xs text-red-500">{errors.credentials}</p>}
          </div>
        )}
        {formData.credentials && formData.credentials.map((cred, idx) => (
          <div key={idx} className="relative flex items-center gap-3 w-full sm:w-[320px] p-3 bg-white border border-gray-200 rounded-xl group hover:border-red-200 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-700 truncate" title={typeof cred === "string" ? `${ins.document || "Tài liệu"} ${idx + 1}` : cred.name}>
                {typeof cred === "string" ? `${ins.document || "Tài liệu"} ${idx + 1}` : cred.name}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {typeof cred === "string" ? (ins.attachedFile || "Tệp đính kèm") : (ins.pdfDocument || "Tài liệu PDF")}
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemoveCredential && onRemoveCredential(idx)}
                className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={ins.remove || "Xóa"}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </FluentCard>
  )
}

export default InstructorCredentials
