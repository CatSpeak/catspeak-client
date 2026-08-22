import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Clock, FileText, Upload, X, Check, RefreshCcw } from 'lucide-react'
import { PillButton } from '@/shared/components/ui/buttons'
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSubmitAssignmentMutation, useGetStudentAssignmentByIdQuery, useGetMyAssignmentSubmissionQuery } from "@/store/api/coursesApi"
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

  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const [isResubmitting, setIsResubmitting] = useState(false)

  // API Queries
  const targetAssignmentId = itemData?.itemId
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation()

  const { data: assignmentResponse, isLoading: isAssignmentLoading } = useGetStudentAssignmentByIdQuery(
    { classId, assignmentId: targetAssignmentId },
    { skip: !classId || !targetAssignmentId }
  )

  const { data: submissionResponse, isLoading: isSubmissionLoading } = useGetMyAssignmentSubmissionQuery(
    { classId, assignmentId: targetAssignmentId },
    { skip: !classId || !targetAssignmentId }
  )

  // Early Returns (Loading / Missing Data)
  if (isAssignmentLoading || isSubmissionLoading) {
    return (
      <LoadingSpinner />
    )
  }

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
          Bài nộp không tồn tại
        </div>
      </div>
    )
  }

  // Derived States & Dictionaries
  const apiAssignment = assignmentResponse?.data || assignmentResponse
  const apiSubmission = submissionResponse?.data || submissionResponse
  const assignmentData = apiAssignment || itemData?.assignment || itemData

  const sa = t.courses?.grading?.studentAssignment || {}

  const title = apiAssignment?.name || itemData?.title || "Bài nộp"
  const description = apiAssignment?.description || itemData?.description || ""
  const deadline = apiAssignment?.dueDate || itemData?.deadline
  const formattedDeadline = deadline ? formatDateTime(deadline) : null
  const isAllowLate = apiAssignment?.allowLateSubmission ?? true

  const dueDateMs = deadline ? new Date(deadline).getTime() : null
  const isExpired = dueDateMs !== null && dueDateMs < now
  const allowSubmission = !isExpired || isAllowLate

  // Attachments Processing
  const attachments = assignmentData?.attachments || assignmentData?.materials || []
  if (!attachments.length && (assignmentData?.fileUrl || assignmentData?.url)) {
    attachments.push({
      title: assignmentData.fileName || assignmentData.title || "Attachment",
      fileUrl: assignmentData.fileUrl || assignmentData.url
    })
  }

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

  const submissionFileUrl = parsedFiles?.[0]?.FileUrl || itemData?.submissionFileUrl || "#"
  const submissionFileName = parsedFiles?.[0]?.FileName || itemData?.submissionFileName || "Bai_lam.docx"
  const submittedAt = apiSubmission?.submittedAt || itemData?.submittedAt
  const score = apiSubmission?.grade ?? itemData?.score ?? "0"
  const feedback = apiSubmission?.comment || itemData?.feedback || "Chưa có nhận xét"

  const rawStatus = apiSubmission?.status || itemData?.status || "pending"
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : "pending"
  const isDone = ["completed", "submitted", "graded", "late", "returned"].includes(normalizedStatus) || itemData?.isCompleted
  const showGrading = ["graded", "returned"].includes(normalizedStatus)


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

    if (!selectedFile) {
      toast.error(sa.contentOrFileRequired || "Vui lòng chọn tệp để nộp");
      return;
    }

    const fileSize = Number(selectedFile.size);
    if (fileSize > 25 * 1024 * 1024) {
      const msg = sa.fileExceedsLimit ? sa.fileExceedsLimit.replace("{{fileName}}", selectedFile.name) : `Kích thước tệp vượt quá giới hạn 25MB`;
      toast.error(msg);
      return;
    }

    const allowedTypes = [".doc", ".docx", ".pdf"];
    const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!allowedTypes.includes(extension)) {
      const msg = sa.fileFormatNotAllowed ? sa.fileFormatNotAllowed.replace("{{formats}}", allowedTypes.join(", ")) : "Định dạng tệp không hợp lệ";
      toast.error(msg);
      return;
    }

    const formData = new FormData();
    formData.append("Files", selectedFile);

    try {
      await submitAssignment({
        classId,
        assignmentId: targetAssignmentId,
        formData
      }).unwrap();

      toast.success(sa.submitSuccess || "Nộp bài thành công!");
      setSelectedFile(null);
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
        Giảng đường
      </PillButton>


      {/* Assignment Info Card */}
      <FluentCard className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">{title}</h1>
          <AssignmentStatusBadge
            status={rawStatus}
            isCompleted={itemData?.isCompleted}
            submittedAt={submittedAt}
            deadline={deadline}
          />
        </div>

        <div className="flex flex-col items-start gap-2 text-sm text-[#7B7979] mb-6 flex-wrap">
          <span className='font-semibold'>Thuộc: {sectionData.name}</span>
          {formattedDeadline && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Hạn nộp {formattedDeadline}</span>
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
                  {att.title || att.fileName || `Tài liệu ${idx + 1}`}
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
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Đã nộp bài</h3>
                    <p className="text-sm text-[#7B7979] mt-0.5">
                      Nộp lúc: {submittedAt ? formatDateTime(submittedAt) : "Vừa xong"}
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
                    Bài đã nộp
                  </PillButton>
                  <PillButton
                    onClick={() => setIsResubmitting(true)}
                    roundedClass='rounded-xl'
                    variant='outline'
                    startIcon={<RefreshCcw size={14} />}
                  >
                    Nộp lại
                  </PillButton>
                </div>
              </div>
            </FluentCard>
          )}

          {showGrading && (
            <FluentCard className="p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Kết quả</h3>

              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="bg-[#faf0f1] rounded-2xl p-4 min-w-[100px] flex flex-col items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-[#c8402e]">{score}</span>
                  <span className="text-sm font-medium text-[#c8402e]/50">/ 10</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#7B7979] uppercase tracking-wider">Nhận xét của giảng viên</span>
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
              {isResubmitting ? "Nộp lại bài" : "Nộp bài của bạn"}
            </h2>
            {isResubmitting && (
              <button
                onClick={() => setIsResubmitting(false)}
                className="text-sm text-[#4B5563] hover:text-[#1A1A1A] transition-colors"
              >
                Hủy
              </button>
            )}
          </div>

          {selectedFile ? (
            <HorizontalCard
              leftContent={<FileText size={24} className="text-[#DC2626]" />}
              rightContent={
                <button
                  onClick={handleRemoveFile}
                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                  title="Xóa tệp"
                >
                  <X size={18} />
                </button>
              }
              className="w-full !p-4 !min-h-0"
            >
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-[#1A1A1A] truncate">{selectedFile.name}</span>
                <span className="text-xs text-[#7B7979]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </HorizontalCard>
          ) : (
            <FluentCard
              className="h-[294px] flex flex-col items-center justify-center transition-colors bg-[#f5f5f5] cursor-pointer hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={28} className="text-[#9CA3AF] mb-3" />
              <p className="text-sm text-[#9CA3AF] mb-1 text-center">Hỗ trợ định dạng doc, pdf, tối đa 1 tệp</p>
              <p className="text-sm text-[#9CA3AF] text-center">Kích cỡ dưới &lt;= 25mb</p>
            </FluentCard>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".doc,.docx,.pdf"
            onChange={handleFileChange}
          />

          <div className="flex items-center justify-between w-full">
            <p className="text-base text-[#7B7979]">
              Cho phép nộp muộn: {isAllowLate ? "Có" : "Không"}
            </p>
            <PillButton
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? "Đang nộp..." : "Nộp bài"}
            </PillButton>
          </div>
        </FluentCard>
      )}
    </div>
  )
}

export default AssignmentDetailView