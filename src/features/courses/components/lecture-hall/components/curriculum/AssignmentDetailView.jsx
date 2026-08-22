import React, { useState, useRef } from 'react'
import { ArrowLeft, Clock, FileText, Upload, X } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { getDisplayData } from "../../utils/curriculumUtils"

const AssignmentDetailView = ({ itemData, onBack }) => {
  const { t, language } = useLanguage()
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall

  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const locale = language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US"
  const displayData = itemData ? getDisplayData(itemData, { ...dict.curriculum, noTitle: dict.postDetail.noTitle }, locale, formatDateTime) : null

  if (!itemData) {
    return (
      <div className="p-6 w-full animate-fade-in">
        <PillButton
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          className='w-fit mb-6'
          variant='secondary-no-outline'
        >
          {dict.postDetail.back || "Quay lại"}
        </PillButton>
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          Bài nộp không tồn tại
        </div>
      </div>
    )
  }

  const assignmentData = itemData.assignment || itemData
  
  // Extract details
  const title = displayData?.title || itemData.title || "Bài nộp"
  const description = assignmentData.description || ""
  const deadline = assignmentData.deadline || assignmentData.dueDate || itemData.deadline
  const formattedDeadline = deadline ? formatDateTime(deadline, "HH:mm . dd/MM/yyyy") : null
  const isAllowLate = assignmentData.allowLateSubmission !== false
  const status = itemData.status || itemData.studentStatus || "pending"
  
  // Mock unit for now, as it's not clear where it comes from
  const unitName = itemData.sectionName || "Chung"

  const attachments = assignmentData.attachments || assignmentData.materials || []
  if (!attachments.length && (assignmentData.fileUrl || assignmentData.url)) {
    attachments.push({
      title: assignmentData.fileName || assignmentData.title || "Attachment",
      fileUrl: assignmentData.fileUrl || assignmentData.url
    })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const renderStatusBadge = () => {
    const isDone = status === "completed" || status === "submitted" || status === "graded" || itemData.isCompleted;
    if (isDone) {
      return <span className="bg-[#D1F7E3] text-[#039855] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">Đã nộp</span>
    }
    return <span className="bg-[#FEF0C7] text-[#B54708] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">Chưa nộp</span>
  }

  const handleDownloadAttachment = (url, name) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col w-full animate-fade-in pb-12">
      <div className="mb-2">
        <PillButton
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          className='w-fit'
          variant='secondary-no-outline'
        >
          Giảng đường
        </PillButton>
      </div>

      {/* Assignment Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E2E2] mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{title}</h1>
          {renderStatusBadge()}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[#7B7979] mb-6 flex-wrap">
          <span>Thuộc: {unitName}</span>
          {formattedDeadline && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Hạn nộp {formattedDeadline}</span>
            </div>
          )}
        </div>

        {description && (
          <div className="text-[#5B403C] text-sm mb-6 whitespace-pre-wrap">
            {description}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div 
                key={idx}
                onClick={() => handleDownloadAttachment(att.fileUrl || att.url, att.title || att.fileName)}
                className="flex items-center gap-2 bg-[#FEF6E7] border border-[#FDE1AB] rounded-lg px-3 py-2 cursor-pointer hover:bg-[#FDE1AB] transition-colors"
              >
                <FileText size={16} className="text-[#F59E0B]" />
                <span className="text-sm text-[#5B403C] truncate max-w-[200px]">
                  {att.title || att.fileName || `Tài liệu ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E2E2]">
        <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] mb-6">Nộp bài của bạn</h2>
        
        <div 
          className={`w-full border rounded-xl p-8 flex flex-col items-center justify-center mb-6 transition-colors ${selectedFile ? 'bg-white border-[#E2E2E2]' : 'bg-[#F9FAFB] border-[#E2E2E2] cursor-pointer hover:bg-gray-100'}`}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="flex items-center justify-between w-full max-w-md bg-white border border-[#E2E2E2] p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText size={24} className="text-[#DC2626] shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-[#1A1A1A] truncate">{selectedFile.name}</span>
                  <span className="text-xs text-[#7B7979]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              <button 
                onClick={handleRemoveFile}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                title="Xóa tệp"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} className="text-[#9CA3AF] mb-3" />
              <p className="text-sm text-[#9CA3AF] mb-1 text-center">Hỗ trợ định dạng doc, pdf, tối đa 1 tệp</p>
              <p className="text-sm text-[#9CA3AF] text-center">Kích cỡ dưới &lt;= 25mb</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".doc,.docx,.pdf"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
          <p className="text-sm text-[#7B7979]">
            Cho phép nộp muộn: {isAllowLate ? "Có" : "Không"}
          </p>
          <PillButton className="!px-8">
            Nộp bài
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default AssignmentDetailView