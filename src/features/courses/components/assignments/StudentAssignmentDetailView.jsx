import React, { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  ChevronLeft,
  FileText,
  Upload,
  Trash2,
  Calendar,
  Paperclip,
  Lock,
  Unlock,
  AlertTriangle,
  Eye
} from "lucide-react"
import {
  useGetStudentAssignmentByIdQuery,
  useGetMyAssignmentSubmissionQuery,
  useSubmitAssignmentMutation
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { formatFileSize, getFileIconColorClass } from "../../utils/courseUtils"
import {
  getFileMeta,
  isAssignmentExpired,
  parseAttachmentList,
} from "../../utils/assignmentUtils"

const StudentAssignmentDetailView = ({ assignment: initialAssignment, classId, onBack }) => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const cg = c.grading || {}
  const ca = c.createAssignment || {}

  const assignmentId = initialAssignment.id

  // Fetch complete/latest details of the assignment for student
  const { data: assignmentResponse, isLoading: isAssignmentLoading } = useGetStudentAssignmentByIdQuery(
    { classId, assignmentId },
    { skip: !classId || !assignmentId }
  )
  const assignment = assignmentResponse?.data || assignmentResponse || initialAssignment

  // Fetch the submission of the student
  const { data: submissionResponse, isLoading: isSubmissionLoading, refetch: refetchSubmission } = useGetMyAssignmentSubmissionQuery(
    { classId, assignmentId },
    { skip: !classId || !assignmentId }
  )
  const submission = submissionResponse?.data || submissionResponse || null

  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation()

  // Form states
  const [textDraft, setTextDraft] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [nowMs] = useState(() => Date.now())
  const textContent = textDraft ?? submission?.contentText ?? ""

  // Get status details
  const isExpired = useMemo(() => {
    return isAssignmentExpired(assignment, nowMs)
  }, [assignment, nowMs])

  const isClosed = useMemo(() => {
    return String(assignment?.status || "").toLowerCase() === "closed"
  }, [assignment?.status])

  const allowSubmission = useMemo(() => {
    if (isClosed) return false
    if (isExpired && !assignment?.allowLateSubmission) return false
    return true
  }, [isClosed, isExpired, assignment?.allowLateSubmission])

  const parsedTeacherAttachments = useMemo(() => {
    const raw = assignment?.attachments || assignment?.files || []
    return parseAttachmentList(raw, (error) => {
      console.error("Failed to parse teacher attachments:", error)
    })
  }, [assignment])

  const parsedSubmissionFiles = useMemo(() => {
    const raw = submission?.files || []
    return parseAttachmentList(raw, (error) => {
      console.error("Failed to parse submission files:", error)
    })
  }, [submission])

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  const addFiles = (filesList) => {
    const maxFiles = Number(assignment?.maxFiles) || 1
    const allowedTypes = assignment?.allowedFileTypes
      ? assignment.allowedFileTypes.split(",").map(t => t.trim().toLowerCase())
      : []

    if (selectedFiles.length + filesList.length > maxFiles) {
      toast.error(
        language === "vi"
          ? `Tối đa ${maxFiles} tệp tin cho phép`
          : `Maximum of ${maxFiles} files allowed`
      )
      return
    }

    const newFiles = []
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i]
      const ext = `.${file.name.split(".").pop().toLowerCase()}`

      // Validate type
      if (allowedTypes.length > 0 && !allowedTypes.includes(ext)) {
        toast.error(
          language === "vi"
            ? `Định dạng tệp ${ext} không hợp lệ. Chỉ chấp nhận: ${assignment.allowedFileTypes}`
            : `File format ${ext} is not allowed. Supported: ${assignment.allowedFileTypes}`
        )
        return
      }

      // Validate size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(
          language === "vi"
            ? `Kích thước tệp ${file.name} vượt quá 50MB`
            : `File ${file.name} exceeds the 50MB limit`
        )
        return
      }

      newFiles.push(file)
    }

    setSelectedFiles((prev) => [...prev, ...newFiles])
  }

  const removePendingFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!allowSubmission) {
      toast.error(
        language === "vi"
          ? "Bài nộp đã khóa hoặc hết hạn nộp!"
          : "Submissions are closed or expired!"
      )
      return
    }

    if (assignment.allowTextSubmission && !textContent.trim() && !assignment.allowFileSubmission) {
      toast.error(
        language === "vi"
          ? "Vui lòng nhập nội dung bài nộp!"
          : "Please enter your submission text!"
      )
      return
    }

    if (assignment.allowFileSubmission && selectedFiles.length === 0 && parsedSubmissionFiles.length === 0 && !assignment.allowTextSubmission) {
      toast.error(
        language === "vi"
          ? "Vui lòng tải lên tệp tin bài làm!"
          : "Please upload at least one file!"
      )
      return
    }

    const formData = new FormData()
    if (assignment.allowTextSubmission) {
      formData.append("ContentText", textContent.trim())
    }

    if (assignment.allowFileSubmission) {
      selectedFiles.forEach((file) => {
        formData.append("Files", file)
      })
    }

    try {
      await submitAssignment({
        classId,
        assignmentId,
        formData
      }).unwrap()

      toast.success(
        language === "vi"
          ? "Nộp bài tập thành công!"
          : "Successfully submitted assignment!"
      )
      setSelectedFiles([])
      refetchSubmission()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || err?.data?.error?.message || "Lỗi khi nộp bài")
    }
  }

  if (isAssignmentLoading || isSubmissionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const getStatusBadge = () => {
    if (!submission) {
      return (
        <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide">
          {cd.statusNotSubmitted || "Chưa nộp"}
        </span>
      )
    }

    const status = (submission.status || "").toLowerCase()
    if (status === "graded") {
      return (
        <span className="bg-amber-50 text-amber-600 text-[10px] font-extrabold px-2.5 py-1 rounded border border-amber-100 uppercase tracking-wide">
          {cg.filterGraded || cd.statusGraded || "Đã chấm"}
        </span>
      )
    }
    if (status === "returned") {
      return (
        <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide">
          {cg.filterReturned || cd.statusGraded || "Đã trả bài"}
        </span>
      )
    }
    if (status === "late") {
      return (
        <span className="bg-red-50 text-red-650 text-[10px] font-extrabold px-2.5 py-1 rounded border border-red-100 uppercase tracking-wide">
          {cg.filterLate || "Nộp muộn"}
        </span>
      )
    }
    return (
      <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-1 rounded border border-orange-100 uppercase tracking-wide">
        {cd.statusNeedsGrading || "Đã nộp"}
      </span>
    )
  }

  // File rendering function
  const renderFileRow = (file, index, isPending = false) => {
    const { name, url, size } = getFileMeta(file)

    return (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl hover:bg-gray-100/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={18} className={getFileIconColorClass(name)} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-800 truncate max-w-[200px] md:max-w-xs">{name}</span>
            <span className="text-[10px] text-gray-400 font-semibold">{formatFileSize(size)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-lg transition-colors"
              title={language === "vi" ? "Xem trực tiếp" : "View file"}
            >
              <Eye size={14} />
            </a>
          )}
          {isPending && (
            <button
              type="button"
              onClick={() => removePendingFile(index)}
              className="p-1.5 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* Header Title & Navigation back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Quay lại"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-tight">
              {assignment.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {getStatusBadge()}

              {isClosed ? (
                <span className="bg-gray-150 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                  <Lock size={10} />
                  {cg.badgeClosed || "Đã đóng"}
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-wide flex items-center gap-1">
                  <Unlock size={10} />
                  {language === "vi" ? "MỞ" : "OPEN"}
                </span>
              )}

              {isExpired ? (
                <span className="bg-red-50 border border-red-100 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeExpired || "Hết hạn"}
                </span>
              ) : (
                <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {cg.badgeUpcoming || "Sắp đến hạn"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Due Date Indicator */}
        {assignment.dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 w-fit">
            <Calendar size={14} className="text-gray-400" />
            <span className="font-semibold">
              {language === "vi" ? "Hạn nộp:" : "Deadline:"}{" "}
              <strong className="text-gray-700 font-extrabold">
                {new Date(assignment.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (65%) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Instructions and Details */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                {ca.descriptionLabel || "Mô tả / Hướng dẫn bài tập"}
              </h3>
            </div>

            <div className="text-xs font-semibold text-gray-700 whitespace-pre-line leading-relaxed min-h-[80px]">
              {assignment.description || (
                <span className="italic text-gray-400 font-medium">
                  {language === "vi" ? "Không có mô tả chi tiết." : "No detailed description provided."}
                </span>
              )}
            </div>

            {/* Teacher attachments */}
            {parsedTeacherAttachments.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Paperclip size={12} />
                  {ca.attachmentsLabel || "Tài liệu đính kèm từ giáo viên"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                  {parsedTeacherAttachments.map((file, idx) => renderFileRow(file, idx))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Details View (if submitted) */}
          {submission && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                    {language === "vi" ? "Bài làm của tôi" : "My Submission"}
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {language === "vi" ? "Nộp lúc:" : "Submitted on:"}{" "}
                  <strong className="text-gray-600 font-extrabold">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
                      : "—"}
                  </strong>
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Submission text response */}
                {assignment.allowTextSubmission && (
                  <div className="mt-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                      {language === "vi" ? "Nội dung bài viết" : "Text Response"}
                    </h4>
                    {submission.contentText ? (
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750 whitespace-pre-line leading-relaxed">
                        {submission.contentText}
                      </div>
                    ) : (
                      <span className="italic text-gray-400 text-xs font-medium">
                        {language === "vi" ? "Không có nội dung trả lời trực tiếp." : "No text response provided."}
                      </span>
                    )}
                  </div>
                )}

                {/* Submission files */}
                {assignment.allowFileSubmission && parsedSubmissionFiles.length > 0 && (
                  <div className="border-t border-gray-50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Paperclip size={12} />
                      {language === "vi" ? "Các tệp tin đã nộp" : "Submitted Files"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {parsedSubmissionFiles.map((file, idx) => renderFileRow(file, idx))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (35%) */}
        <div className="flex flex-col gap-6">
          {/* Grade and feedback panel (if graded/returned) */}
          {submission && (submission.status?.toLowerCase() === "graded" || submission.status?.toLowerCase() === "returned") && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5 border-t-4 border-t-emerald-500 animate-fadeIn">
              <h3 className="text-xs font-black text-gray-400 tracking-wider uppercase leading-none">
                {language === "vi" ? "KẾT QUẢ ĐÁNH GIÁ" : "GRADING DETAILS"}
              </h3>

              <div className="flex items-center gap-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 shadow-2xs">
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {submission.grade !== null && submission.grade !== undefined ? submission.grade : "—"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 leading-none">
                    {language === "vi" ? `Thang điểm tối đa ${assignment.maxScore}` : `Out of ${assignment.maxScore}`}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider mt-2 inline-block w-fit">
                    {submission.status?.toLowerCase() === "graded" ? (cg.filterGraded || "ĐÃ CHẤM") : (cg.filterReturned || "ĐÃ TRẢ BÀI")}
                  </span>
                </div>
              </div>

              {/* Feedback comment */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">
                  {cg.generalFeedback || "Nhận xét của giáo viên"}
                </span>
                {submission.comment ? (
                  <p className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-750 leading-relaxed whitespace-pre-line">
                    {submission.comment}
                  </p>
                ) : (
                  <p className="italic text-gray-400 text-xs font-medium pl-1">
                    {language === "vi" ? "Chưa có nhận xét chi tiết." : "No feedback comments provided."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submission Form panel */}
          {allowSubmission ? (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
                <h3 className="text-sm font-extrabold text-[#990011] uppercase tracking-wider">
                  {submission ? (language === "vi" ? "NỘP LẠI BÀI" : "RESUBMIT") : (language === "vi" ? "NỘP BÀI" : "SUBMIT ASSIGNMENT")}
                </h3>
              </div>

              {/* Text submission input */}
              {assignment.allowTextSubmission && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider uppercase flex justify-between">
                    <span>{ca.directInput || "Nội dung bài làm"}</span>
                    {submission && <span className="text-orange-600 font-extrabold text-[9px] uppercase">({language === "vi" ? "Cập nhật bài làm" : "Update"})</span>}
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextDraft(e.target.value)}
                    placeholder={language === "vi" ? "Nhập nội dung bài làm của bạn tại đây..." : "Type your submission here..."}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-750 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] shadow-2xs resize-none leading-relaxed transition-all"
                  />
                </div>
              )}

              {/* File submission drag-and-drop */}
              {assignment.allowFileSubmission && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-black text-gray-400 tracking-wider uppercase leading-none">
                    {ca.uploadFile || "Tải lên tệp tin"}
                  </label>
                  <div className="text-[10px] text-gray-400 font-semibold leading-normal">
                    {language === "vi"
                      ? `Hỗ trợ: ${assignment.allowedFileTypes || "Tất cả"} (Tối đa ${assignment.maxFiles || 1} tệp, tối đa 50MB/tệp)`
                      : `Supported formats: ${assignment.allowedFileTypes || "Any"} (Max ${assignment.maxFiles || 1} files, 50MB max each)`}
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive
                      ? "border-[#990011] bg-[#990011]/5"
                      : "border-gray-255 hover:border-gray-400 hover:bg-gray-50/50"
                      }`}
                  >
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-700 leading-snug">
                      {ca.dropzoneMainText || "Nhấn để chọn tệp hoặc kéo thả vào đây"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={Number(assignment?.maxFiles) > 1}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* List of pending files */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">
                        {language === "vi" ? "Tệp chuẩn bị tải lên:" : "Files pending upload:"}
                      </span>
                      {selectedFiles.map((file, idx) => renderFileRow(file, idx, true))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Upload size={14} />
                    <span>
                      {submission
                        ? (language === "vi" ? "NỘP LẠI BÀI" : "RESUBMIT ASSIGNMENT")
                        : (language === "vi" ? "NỘP BÀI TẬP" : "SUBMIT ASSIGNMENT")}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 border-t-4 border-t-red-500 animate-fadeIn">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <AlertTriangle size={14} />
                {language === "vi" ? "BÀI NỘP ĐÃ KHÓA" : "SUBMISSIONS CLOSED"}
              </h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                {isClosed
                  ? (language === "vi" ? "Giảng viên đã khóa hoặc đóng bài tập này, học viên không thể nộp bài hoặc chỉnh sửa bài làm." : "The instructor has locked submissions for this assignment. You cannot submit or edit.")
                  : (language === "vi" ? "Hạn nộp bài đã qua và nộp muộn không được cho phép đối với bài tập này." : "The submission deadline has passed and late submissions are not allowed for this assignment.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentAssignmentDetailView
