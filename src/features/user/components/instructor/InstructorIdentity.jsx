import React, { useRef } from "react"
import { Upload, Edit2 } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

const InstructorIdentity = ({ formData, onEdit, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

  const renderUploadBox = (label, fieldName, fileData, errorText) => {
    return (
      <div id={`field-${fieldName}File`} className="flex flex-col gap-1 w-full max-w-[220px]">
        <div
        onClick={() => !readOnly && onEdit(fieldName)}
        className={`relative flex flex-col items-center justify-center w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden group ${
          fileData ? "border border-solid border-gray-200 shadow-sm" : `border-2 border-dashed ${errorText ? "border-red-500 bg-red-50/10" : "border-gray-300"}`
        } ${!readOnly ? "cursor-pointer hover:border-red-300 hover:bg-red-50/10 transition-colors" : ""}`}
      >
        {fileData ? (
          <>
            <img
              src={typeof fileData === "string" ? fileData : URL.createObjectURL(fileData)}
              alt={label}
              className="w-full h-full object-cover"
            />
            {!readOnly && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                <Edit2 className="w-8 h-8 text-white drop-shadow-md" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="text-[13px] font-medium text-gray-400 group-hover:text-red-500 transition-colors">{label}</span>
          </div>
        )}
      </div>
      {errorText && <p className="text-xs text-red-500 mt-1">{errorText}</p>}
      </div>
    )
  }

  return (
    <FluentCard className="gap-4 !justify-start">
      <h2 className="text-xl font-bold text-gray-900">
        {ins.idCard || "Căn cước công dân"}
      </h2>
      
      <div className="flex gap-4">
        {renderUploadBox(ins.idFront || "Mặt trước", "idFront", formData.idFrontFile, errors.idFrontFile)}
        {renderUploadBox(ins.idBack || "Mặt sau", "idBack", formData.idBackFile, errors.idBackFile)}
      </div>
      
      <p className="text-[11px] text-gray-400">
        {ins.idWarning || "Sau khi xác nhận và gửi thông tin, thông tin nhận dạng của bạn không thể thay đổi!"}
      </p>
    </FluentCard>
  )
}

export default InstructorIdentity
