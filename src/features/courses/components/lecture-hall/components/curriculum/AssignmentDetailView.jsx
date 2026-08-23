import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Clock, FileText, Upload, X, Check, RefreshCcw } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSubmitAssignmentMutation } from "@/store/api/coursesApi"
import { useTimezone } from "@/shared/hooks/useTimezone"
import FluentCard from '@/shared/components/ui/FluentCard'
import HorizontalCard from '@/shared/components/ui/HorizontalCard'
import { LoadingSpinner } from '@/shared/components/ui/indicators'
import AssignmentStatusBadge from './AssignmentStatusBadge'

const AssignmentDetailView = ({ itemData, onBack, sectionData }) => {
  // Hooks & Basic Variables
  const { classId: routeClassId, id: routeId } = useParams()
  const classId = routeClassId || routeId
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const [now] = useState(() => Date.now())

  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)
  const [isResubmitting, setIsResubmitting] = useState(false)

  // API Queries
  const targetAssignmentId = itemData?.itemId
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation()

  console.log(itemData)

  if (!itemData) {
    return (
      <div className="p-6 w-full animate-fade-in">
        <PillButton
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          className="w-fit mb-6"
          variant="secondary-no-outline"
        >
          {t.courses?.lectureHall?.postDetail?.back || "Quay lại"}
        </PillButton>
        <div className="text-center py-12 text-sm text-[#EF4444] border border-dashed border-[#FCA5A5] rounded-xl bg-[#FEF2F2]">
          {sa.assignmentNotFound || "Bài nộp không tồn tại"}
        </div>
      </div>
    )
  }

  // Derived States & Dictionaries
  const assignmentData = itemData?.assignment || itemData
  const apiAssignment = assignmentData
  const apiSubmission = assignmentData?.studentSubmission

  const sa = t.courses?.grading?.studentAssignment || {}
  const dict = t.courses?.lectureHall?.curriculum || {}

  const title = apiAssignment?.name || dict.assignment || "Bài nộp"
  const description = apiAssignment?.description || ""
  const deadline = apiAssignment?.dueDate
  const formattedDeadline = deadline ? formatDateTime(deadline) : null
  const isAllowLate = apiAssignment?.allowLateSubmission ?? true
  const maxFiles = apiAssignment?.maxFiles ?? 1

  const dueDateMs = deadline ? new Date(deadline).getTime() : null
  const isExpired = dueDateMs !== null && dueDateMs < now
  const allowSubmission = !isExpired || isAllowLate

  // Attachments Processing
  const attachments = apiAssignment?.attachments || []

  // Submission Details Processing
  let parsedFiles = []
  if (typeof apiSubmission?.files === 'string') {
    try {
      parsedFiles = JSON.parse(apiSubmission.files)
    } catch (e) {
      console.error("Failed to parse submission files:", e)
    }
  } else if (Array.isArray(apiSubmission?.files)) {
    parsedFiles = apiSubmission.files
  }

  const submissionFileUrl = parsedFiles?.[0]?.FileUrl || "#"
  const submissionFileName = parsedFiles?.[0]?.FileName || "Bai_lam.docx"
  const submittedAt = apiSubmission?.submittedAt
  const score = apiSubmission?.score ?? "0"
  const feedback = apiSubmission?.contentText || sa.noFeedback || "Chưa có nhận xét"

  const rawStatus = apiSubmission?.status || "pending"
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : "pending"
  const isDone = ["completed", "submitted", "graded", "late", "returned"].includes(normalizedStatus)
  const showGrading = ["graded", "returned"].includes(normalizedStatus)


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + newFiles.length;
      if (totalFiles > maxFiles) {
        toast.error((sa.maxFilesAllowed || "Bạn chỉ được nộp tối đa {{maxFiles}} tệp").replace("{{maxFiles}}", maxFiles));
        return;
      }
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  }

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleSubmit = async () => {
    const targetAssignmentId = assignmentData?.id || itemData?.id;
    if (!classId || !targetAssignmentId) {
      toast.error(sa.submissionsClosedOrExpired || "Không tìm thấy thông tin lớp học hoặc bài tập");
      return;
    }

    if (!allowSubmission) {
      toast.error(sa.submissionsClosedOrExpired || "Đã quá hạn nộp bài");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error(sa.contentOrFileRequired || "Vui lòng chọn tệp để nộp");
      return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      toast.error(sa.fileExceedsLimit?.replace("{{fileName}}", "Total") || "Tổng kích thước tệp vượt quá giới hạn 25MB");
      return;
    }

    const allowedTypes = [".doc", ".docx", ".pdf"];
    for (const file of selectedFiles) {
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedTypes.includes(extension)) {
        const msg = sa.fileFormatNotAllowed ? sa.fileFormatNotAllowed.replace("{{formats}}", allowedTypes.join(", ")) : "Định dạng tệp không hợp lệ";
        toast.error(msg);
        return;
      }
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("Files", file);
    });

    try {
      await submitAssignment({
        classId,
        assignmentId: targetAssignmentId,
        formData
      }).unwrap();

      toast.success(sa.submitSuccess || "Nộp bài thành công!");
      setSelectedFiles([]);
      setIsResubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error(sa.submitError || "Nộp bài thất bại, vui lòng thử lại sau.");
    }
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
    <div className="w-full animate-fade-in space-y-6">

      <PillButton
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        className='w-fit'
        variant='secondary-no-outline'
      >
        {t.courses?.lectureHall?.title}
      </PillButton>


      {/* Assignment Info Card */}
      <FluentCard className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{title}</h1>
          <AssignmentStatusBadge
            classId={classId}
            assignmentId={targetAssignmentId}
            assignment={{ dueDate: deadline, ...assignmentData }}
            submission={apiSubmission}
            isCompleted={itemData?.isCompleted}
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-sm text-[#7B7979] mb-6 flex-wrap">
          <span className='font-semibold'>{dict.belongsTo || "Thuộc"}: {sectionData?.name || dict.generalSection || "Mục chung"}</span>
          {formattedDeadline && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{dict.dueDateMeta ? dict.dueDateMeta.replace("{{date}}", formattedDeadline) : `Hạn nộp ${formattedDeadline}`}</span>
            </div>
          )}
        </div>

        {description && (
          <div
            className="text-[#5B403C] text-sm mb-6 whitespace-pre-wrap assignment-description-html"
            dangerouslySetInnerHTML={{ __html: description }}
          />
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
                <span className="text-sm text-[#5B403C] truncate w-full">
                  {att.title || att.fileName || (dict.unnamedMaterial ? `${dict.unnamedMaterial} ${idx + 1}` : `Tài liệu ${idx + 1}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </FluentCard>

      {/* Submission Status & Grading */}
      {(isDone && !isResubmitting) ? (
        <>
          {!showGrading && (
            <FluentCard className="p-4 sm:p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#e7effb] flex items-center justify-center shrink-0">
                    <Check size={24} className="text-[#1c6dd7]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">{sa.submittedHeading || "Đã nộp bài"}</h3>
                    <p className="text-sm text-[#7B7979] mt-0.5">
                      {t.courses?.grading?.submittedAtLabel || "Nộp lúc: "} {submittedAt ? formatDateTime(submittedAt) : (t.courses?.grading?.justNow || "Vừa xong")}
                    </p>
                    <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7B7979] mt-0.5 hover:underline">
                      {submissionFileName}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PillButton
                    variant='outline'
                    borderColor={"#1A1C1C"}
                    textColor={"#1A1C1C"}
                    roundedClass='rounded-xl'
                    onClick={() => handleDownloadAttachment(submissionFileUrl, submissionFileName)}
                    startIcon={<FileText size={14} />}
                  >
                    {t.courses?.grading?.mySubmission || "Bài đã nộp"}
                  </PillButton>
                  <PillButton
                    onClick={() => setIsResubmitting(true)}
                    roundedClass='rounded-xl'
                    variant='outline'
                    startIcon={<RefreshCcw size={14} />}
                  >
                    {sa.resubmitButton || "Nộp lại"}
                  </PillButton>
                </div>
              </div>
            </FluentCard>
          )}

          {showGrading && (
            <FluentCard className="p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">{t.courses?.grading?.examResult || "Kết quả"}</h3>

              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="bg-[#faf0f1] rounded-2xl p-4 min-w-[100px] flex flex-col items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-[#c8402e]">{score}</span>
                  <span className="text-sm font-medium text-[#c8402e]/50">/ 10</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#7B7979] uppercase tracking-wider">{t.courses?.grading?.generalFeedback || "Nhận xét của giảng viên"}</span>
                  <p className="text-sm text-[#1A1C1C]">
                    {feedback}
                  </p>
                </div>
              </div>
            </FluentCard>
          )}
        </>
      ) : (
        <FluentCard className="p-4 sm:p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">
              {isResubmitting ? (sa.resubmitHeading || "Nộp lại bài") : (sa.submitHeading || "Nộp bài của bạn")}
            </h2>
            {isResubmitting && (
              <button
                onClick={() => setIsResubmitting(false)}
                className="text-sm text-[#4B5563] hover:text-[#1A1A1A] transition-colors"
              >
                {sa.cancel || t.courses?.grading?.studentQuiz?.cancel || "Hủy"}
              </button>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              {selectedFiles.map((file, idx) => (
                <HorizontalCard
                  key={idx}
                  leftContent={<FileText size={24} className="text-[#DC2626]" />}
                  rightContent={
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  }
                  className="w-full !p-4 !min-h-0"
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-[#1A1A1A] truncate">{file.name}</span>
                    <span className="text-xs text-[#7B7979]">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </HorizontalCard>
              ))}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".doc,.docx,.pdf"
            multiple={maxFiles > 1}
            onChange={handleFileChange}
          />

          {selectedFiles.length < maxFiles && (
            <FluentCard
              className="h-[150px] flex flex-col items-center justify-center transition-colors bg-[#f5f5f5] cursor-pointer hover:bg-gray-100 mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={28} className="text-[#9CA3AF] mb-3" />
              <p className="text-sm text-[#9CA3AF] mb-1 text-center">
                {sa.supportedFilesSummary
                  ? sa.supportedFilesSummary.replace("{{formats}}", "doc, pdf").replace("{{maxFiles}}", maxFiles)
                  : `Hỗ trợ định dạng doc, pdf, tối đa ${maxFiles} tệp`}
              </p>
              <p className="text-sm text-[#9CA3AF] text-center">{sa.fileExceedsLimit?.replace("{{fileName}}", "Total").replace("50 MB", "25MB") || "Tổng kích cỡ dưới <= 25mb"}</p>
            </FluentCard>
          )}


          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[#7B7979]">
              {sa.allowLateSubmission || "Cho phép nộp muộn"}: {isAllowLate ? (dict.yes || "Có") : (dict.no || "Không")}
            </p>
            <PillButton
              onClick={handleSubmit}
              disabled={isSubmitting || selectedFiles.length === 0}
            >
              {isSubmitting ? (sa.submittingAssignment || "Đang nộp...") : (sa.submitButton || "Nộp bài")}
            </PillButton>
          </div>
        </FluentCard>
      )}
    </div>
  )
}

export default AssignmentDetailView