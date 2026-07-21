import React, { useState, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  useGetClassDetailQuery,
  useCreateAssignmentMutation,
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation
} from "@/store/api/coursesApi"
import { formatFileSize } from "../utils/courseUtils"
import { parseLocalDateString, toDueDateIso, toLocalDateString } from "../utils/dateUtils"
import {
  clampMaxFiles,
  getAssignmentErrorMessage,
  getAssignmentFormDefaults,
  getFileMeta,
} from "../utils/assignmentUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ReactDatePicker from "react-datepicker"
import "@/shared/styles/react-datepicker.css"
import { Editor } from "@tinymce/tinymce-react"
import {
  Calendar,
  Clock,
  Upload,
  FileText,
  Trash2,
  ChevronDown,
  X,
  Check,
  ChevronRight
} from "lucide-react"

const CreateAssignmentForm = ({ id, assignmentId, classData, initialAssignment, language, t }) => {
  const navigate = useNavigate()
  const c = t.courses || {}
  const ca = c.createAssignment || {}
  const defaults = getAssignmentFormDefaults(initialAssignment)

  const [createAssignment] = useCreateAssignmentMutation()
  const [updateAssignment] = useUpdateAssignmentMutation()

  // Editor mock state
  const [editorText, setEditorText] = useState(() => defaults.editorText)

  // Form States
  const [title, setTitle] = useState(() => defaults.title)
  const [dueDate, setDueDate] = useState(() => defaults.dueDate)
  const [dueTime, setDueTime] = useState(() => defaults.dueTime)
  const [allowLateSubmission, setAllowLateSubmission] = useState(() => defaults.allowLateSubmission)

  const buildAssignmentFormData = (status) => {
    const formData = new FormData()
    const dueDateIso = toDueDateIso(dueDate, dueTime)

    formData.append("Name", title.trim() || "Bài tập chưa đặt tên")
    formData.append("Description", editorText || "")
    if (dueDateIso) {
      formData.append("DueDate", dueDateIso)
    }
    formData.append("AllowLateSubmission", String(allowLateSubmission))
    formData.append("AllowFileSubmission", String(submissionTypeFile))
    formData.append("AllowTextSubmission", String(submissionTypeText))
    formData.append("AllowedFileTypes", allowedFileTypes.filter(Boolean).map(t => `.${t.toLowerCase()}`).join(","))
    formData.append("MaxFiles", String(clampMaxFiles(maxFiles)))
    formData.append("HasGrading", String(enableGrading))
    formData.append("MaxScore", String(gradeScale === "scale100" ? 100 : 10))
    formData.append("ReleaseMode", resultRelease === "automatic" ? "Automatic" : "Manual")
    formData.append("PostToBulletinBoard", String(postToFeed))
    formData.append("Status", status)
    formData.append("status", status)

    // Append existing files to keep
    existingAttachments.forEach((f) => {
      formData.append("KeepAttachments", getFileMeta(f).url || f.path || JSON.stringify(f))
    })

    attachedFiles.forEach((f) => {
      if (f.file) {
        formData.append("attachments", f.file)
      }
    })

    return formData
  }

  // File Upload State (Empty by default)
  const [attachedFiles, setAttachedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Sidebar Config States
  const [submissionTypeFile, setSubmissionTypeFile] = useState(() => defaults.submissionTypeFile)
  const [submissionTypeText, setSubmissionTypeText] = useState(() => defaults.submissionTypeText)
  const [allowedFileTypes, setAllowedFileTypes] = useState(() => defaults.allowedFileTypes)
  const [maxFiles, setMaxFiles] = useState(() => defaults.maxFiles)
  const [enableGrading, setEnableGrading] = useState(() => defaults.enableGrading)
  const [gradeScale, setGradeScale] = useState(() => defaults.gradeScale) // scale10, scale100
  const [resultRelease, setResultRelease] = useState(() => defaults.resultRelease) // manual, automatic
  const [publishStatus, setPublishStatus] = useState(() => defaults.publishStatus) // now, draft
  const [postToFeed, setPostToFeed] = useState(true)

  // State for existing attachments to keep
  const [existingAttachments, setExistingAttachments] = useState(() => defaults.existingAttachments)

  // Handle Drag & Drop Upload Mocking
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
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
    if (attachedFiles.length + filesList.length > 5) {
      toast.error(ca.toastMaxFiles || "Tối đa 5 tài liệu đính kèm")
      return
    }

    const newFiles = Array.from(filesList).map((file, idx) => {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
      return {
        id: `uploaded-file-${Date.now()}-${idx}`,
        name: file.name,
        size: `${sizeInMB} MB`,
        file
      }
    })

    setAttachedFiles((prev) => [...prev, ...newFiles])
    toast.success(ca.toastUploadSuccess || "Đã đính kèm tài liệu thành công")
  }

  const removeFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId))
    toast.success(ca.toastDeleteSuccess || "Đã xóa tài liệu đính kèm")
  }

  // Remove individual file type tag
  const removeFileType = (type) => {
    setAllowedFileTypes((prev) => prev.filter((t) => t !== type))
  }

  // Handle Action Buttons
  const handleCancel = () => {
    navigate(`/workspace/courses/class/${id}`)
  }

  const handleSaveDraft = async () => {
    try {
      if (assignmentId) {
        await updateAssignment({
          classId: id,
          assignmentId,
          formData: buildAssignmentFormData("Draft")
        }).unwrap()
        toast.success(ca.successDraft || "Đã lưu bản nháp bài nộp")
      } else {
        await createAssignment({ classId: id, formData: buildAssignmentFormData("Draft") }).unwrap()
        toast.success(ca.successDraft || "Đã lưu bản nháp bài nộp")
      }
      navigate(`/workspace/courses/class/${id}`)
    } catch (err) {
      console.error(err)
      toast.error(getAssignmentErrorMessage(err, "Lỗi khi lưu bản nháp bài nộp"))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const targetStatus = publishStatus === "draft" ? "Draft" : "Published"

    // Form Validation
    if (!title.trim() && targetStatus === "Published") {
      toast.error(ca.errTitle || "Vui lòng nhập tên bài nộp")
      return
    }
    if (!dueDate && targetStatus === "Published") {
      toast.error(ca.errDueDate || "Vui lòng chọn ngày hết hạn")
      return
    }
    if (!dueTime && targetStatus === "Published") {
      toast.error(ca.errDueTime || "Vui lòng chọn giờ nộp")
      return
    }
    if (!submissionTypeFile && !submissionTypeText) {
      toast.error(ca.errSubmissionType || "Vui lòng chọn ít nhất một hình thức nộp bài")
      return
    }

    try {
      if (assignmentId) {
        await updateAssignment({
          classId: id,
          assignmentId,
          formData: buildAssignmentFormData(targetStatus)
        }).unwrap()
        toast.success(ca.successUpdate || "Cập nhật bài nộp thành công!")
      } else {
        await createAssignment({ classId: id, formData: buildAssignmentFormData(targetStatus) }).unwrap()
        toast.success(targetStatus === "Draft"
          ? (ca.successDraft || "Đã lưu bản nháp bài nộp")
          : (ca.successCreate || "Tạo bài nộp thành công!")
        )
      }
      navigate(`/workspace/courses/class/${id}`)
    } catch (err) {
      console.error(err)
      toast.error(getAssignmentErrorMessage(err, assignmentId ? "Lỗi khi cập nhật bài nộp" : "Lỗi khi tạo bài nộp"))
    }
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumbs ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>
            {t.nav?.home || "Trang chủ"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>
            {c.title || "Khóa học của tôi"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses/all")}>
            {c.allCourses?.title || "Toàn bộ khóa học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classData.courseId || ""}`)}>
            {c.student?.courseDetails || "Chi tiết khóa học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/class/${id}`)}>
            {classData.name || c.student?.classDetails || "Chi tiết lớp học"}
          </span>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-[#990011] font-semibold">{assignmentId ? (language === "vi" ? "Chỉnh sửa bài nộp" : "Edit Assignment") : (ca.pageTitle || "Tạo bài nộp")}</span>
        </div>
      </div>

      {/* ─── Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">{assignmentId ? (language === "vi" ? "Chỉnh sửa bài nộp" : "Edit Assignment") : (ca.pageTitle || "Tạo bài nộp")}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ─── Form Content Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ─── LEFT COLUMN: Main Form ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">

            {/* 1. Tên bài nộp */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">
                {ca.assignmentName || "Tên bài nộp"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={ca.assignmentNamePlaceholder || "Nhập tên bài nộp (VD: Bài kiểm tra giữa kỳ)"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all text-sm"
              />
            </div>

            {/* 2. Mô tả / Yêu cầu */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800">{ca.descriptionLabel || "Yêu cầu bài tập"}</label>
              <div className="assignment-editor overflow-hidden transition-all">
                <Editor
                  tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
                  value={editorText}
                  onEditorChange={(newVal) => setEditorText(newVal)}
                  init={{
                    height: 250,
                    menubar: false,
                    statusbar: false,
                    plugins: ["autolink", "lists", "link", "charmap", "emoticons"],
                    toolbar:
                      "bold italic underline strikethrough | emoticons link | bullist numlist",
                    placeholder: ca.descriptionPlaceholder || "Nhập hướng dẫn chi tiết cho học sinh...",
                    skin: "oxide",
                    setup: (editor) => {
                      editor.on("focus", () => { })
                    },
                  }}
                />
              </div>
            </div>

            {/* 3. Tài liệu đính kèm */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                <span>{ca.attachmentsLabel || "Tài liệu đính kèm"}</span>
                <span className="text-xs text-gray-400 font-medium">{ca.maxFilesNote || "Tối đa 5 files"}</span>
              </div>

              {/* Drag drop zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-red-100 hover:border-[#990011] bg-red-50/10 hover:bg-red-50/20 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#990011] group-hover:scale-110 transition-transform">
                  <Upload size={20} />
                </div>
                <div className="text-sm font-bold text-[#990011] tracking-wide">
                  {ca.dropzoneMainText || "Nhấn để tải lên hoặc kéo thả file vào đây"}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  {ca.dropzoneSubText || "Hỗ trợ PDF, DOCX, XLSX, PPTX, JPG, PNG (Max 50MB/file)"}
                </div>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.pptx,.jpg,.png"
                />
              </div>

              {/* Attached file list */}
              {(existingAttachments.length > 0 || attachedFiles.length > 0) && (
                <div className="flex flex-col gap-2 mt-2">
                  {/* Existing attachments */}
                  {existingAttachments.map((file, idx) => {
                    const { name, size } = getFileMeta(file)
                    const fileId = file.id || `existing-${idx}`
                    return (
                      <div
                        key={fileId}
                        className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500">
                            <FileText size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[200px] md:max-w-md">
                              {name}
                            </span>
                            {size > 0 && (
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {formatFileSize(size)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExistingAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}

                  {/* New attachments */}
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-gray-50 border border-gray-150 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-red-500">
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 leading-tight truncate max-w-[200px] md:max-w-md">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {file.size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Ngày hết hạn & Giờ nộp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ngày hết hạn */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-gray-800">
                  {ca.dueDate || "Ngày hết hạn"} <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <ReactDatePicker
                    selected={parseLocalDateString(dueDate)}
                    onChange={(date) => setDueDate(date ? toLocalDateString(date) : "")}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    wrapperClassName="w-full"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all text-sm cursor-pointer"
                  />
                </div>
              </div>

              {/* Giờ nộp */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-gray-800">
                  {ca.dueTime || "Giờ nộp"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all text-sm cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 5. Cho phép nộp muộn */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-gray-850">{ca.allowLateSubmission || "Cho phép nộp muộn"}</span>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {ca.allowLateSubmissionSub || "Học sinh có thể nộp bài sau hạn chót"}
                </span>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => setAllowLateSubmission(!allowLateSubmission)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allowLateSubmission ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${allowLateSubmission ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Configuration Sidebar ─── */}
          <div className="flex flex-col gap-6 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">

            {/* Sidebar Title */}
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">{ca.sidebarTitle || "Cấu hình bài nộp"}</h2>
              <div className="h-px bg-gray-200 w-full mt-4" />
            </div>

            {/* Hình thức nộp bài */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gray-800">{ca.submissionFormat || "Hình thức nộp bài"}</span>

              {/* Checkbox 1: Tải lên file */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmissionTypeFile(!submissionTypeFile)}
                  className={`w-5 h-5 border rounded-lg flex items-center justify-center transition-all ${submissionTypeFile
                    ? "bg-[#990011] border-[#990011] text-white"
                    : "border-gray-300 hover:border-[#990011]"
                    }`}
                >
                  {submissionTypeFile && <Check size={12} strokeWidth={3} />}
                </button>
                <span
                  onClick={() => setSubmissionTypeFile(!submissionTypeFile)}
                  className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
                >
                  {ca.uploadFile || "Tải lên file"}
                </span>
              </div>

              {/* Checkbox 2: Nhập nội dung trực tiếp */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmissionTypeText(!submissionTypeText)}
                  className={`w-5 h-5 border rounded-lg flex items-center justify-center transition-all ${submissionTypeText
                    ? "bg-[#990011] border-[#990011] text-white"
                    : "border-gray-300 hover:border-[#990011]"
                    }`}
                >
                  {submissionTypeText && <Check size={12} strokeWidth={3} />}
                </button>
                <span
                  onClick={() => setSubmissionTypeText(!submissionTypeText)}
                  className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
                >
                  {ca.directInput || "Nhập nội dung trực tiếp"}
                </span>
              </div>
            </div>

            {/* Loại file cho phép */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gray-800">{ca.allowedFileTypes || "Loại file cho phép"}</span>

              <div className="relative">
                <select
                  value="all"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && !allowedFileTypes.includes(val) && val !== "all") {
                      setAllowedFileTypes((prev) => [...prev, val])
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] text-xs font-semibold text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">{ca.allFormats || "Tất cả định dạng"}</option>
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PPTX">PPTX</option>
                  <option value="JPG">JPG</option>
                  <option value="PNG">PNG</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Allowed type tags */}
              {allowedFileTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {allowedFileTypes.map((type) => (
                    <span
                      key={type}
                      className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeFileType(type)}
                        className="hover:text-orange-950 transition-colors"
                      >
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Số file tối đa */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-800">{ca.maxFilesCount || "Số file tối đa"}</span>
              <input
                type="number"
                min={1}
                max={5}
                value={maxFiles}
                onChange={(e) => setMaxFiles(clampMaxFiles(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] text-xs font-semibold text-gray-700 shadow-xs"
              />
            </div>

            <div className="h-px bg-gray-200 w-full my-2" />

            {/* Chấm điểm toggle */}
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-bold text-gray-800">{ca.gradingLabel || "Chấm điểm"}</span>
              <button
                type="button"
                onClick={() => setEnableGrading(!enableGrading)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enableGrading ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${enableGrading ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Thang điểm */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-800">{ca.gradingScale || "Thang điểm"}</span>
              <div className="relative">
                <select
                  value={gradeScale}
                  onChange={(e) => setGradeScale(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] text-xs font-semibold text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="scale10">{ca.scale10 || "Thang điểm 10"}</option>
                  <option value="scale100">{ca.scale100 || "Thang điểm 100"}</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Công bố kết quả */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-800">{ca.resultRelease || "Công bố kết quả"}</span>
              <div className="relative">
                <select
                  value={resultRelease}
                  onChange={(e) => setResultRelease(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] text-xs font-semibold text-gray-700 appearance-none bg-white cursor-pointer"
                >
                  <option value="manual">{ca.releaseManual || "Công bố thủ công"}</option>
                  <option value="automatic">{ca.releaseAutomatic || "Tự động công bố sau khi chấm"}</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="h-px bg-gray-200 w-full my-2" />

            {/* Trạng thái đăng */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold text-gray-800">{ca.publishStatus || "Trạng thái đăng"}</span>

              <div className="flex flex-col gap-2.5">
                {/* Radio: Đăng ngay */}
                <div
                  onClick={() => setPublishStatus("now")}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPublishStatus("now")
                    }}
                    className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "now"
                      ? "border-[#990011]"
                      : "border-gray-300"
                      }`}
                  >
                    {publishStatus === "now" && (
                      <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                    )}
                  </button>
                  <span className="text-xs font-semibold text-gray-750">
                    {ca.publishNow || "Đăng ngay"}
                  </span>
                </div>

                {/* Radio: Lưu nháp */}
                <div
                  onClick={() => setPublishStatus("draft")}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPublishStatus("draft")
                    }}
                    className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all ${publishStatus === "draft"
                      ? "border-[#990011]"
                      : "border-gray-300"
                      }`}
                  >
                    {publishStatus === "draft" && (
                      <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                    )}
                  </button>
                  <span className="text-xs font-semibold text-gray-750">
                    {ca.saveDraft || "Lưu nháp"}
                  </span>
                </div>
              </div>
            </div>

            {/* Đăng lên bảng tin lớp học */}
            <div className="bg-red-50/20 border border-red-100 rounded-2xl p-4 flex justify-between items-center shadow-xs">
              <span className="text-xs font-bold text-gray-800">{ca.postToFeed || "Đăng lên bảng tin lớp học"}</span>
              <button
                type="button"
                onClick={() => setPostToFeed(!postToFeed)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${postToFeed ? "bg-[#990011]" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${postToFeed ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

          </div>

        </div>

        {/* ─── Footer Buttons ─── */}
        <div className="flex justify-between items-center py-4 border-t border-gray-150 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs font-extrabold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-wider"
          >
            {ca.btnCancel || "Hủy"}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="h-10 px-5 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-xs"
            >
              {ca.btnSaveDraft || "Lưu nháp"}
            </button>
            <button
              type="submit"
              className="h-10 px-6 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 shadow-md"
            >
              {assignmentId ? (language === "vi" ? "Lưu thay đổi" : "Save Changes") : (ca.btnCreate || "Tạo bài nộp")}
            </button>
          </div>
        </div>

      </form>

    </div>
  )
}

const CreateAssignmentPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")
  const { language, t } = useLanguage()

  const { data: detailResponse, isLoading: isClassLoading } = useGetClassDetailQuery(id)
  const { data: assignmentResponse, isLoading: isAssignmentLoading } = useGetAssignmentByIdQuery(
    { classId: id, assignmentId },
    { skip: !id || !assignmentId }
  )

  if (isClassLoading || (assignmentId && isAssignmentLoading)) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  const classData = detailResponse?.data || detailResponse || {}
  const assignmentData = assignmentResponse?.data || assignmentResponse || null

  return (
    <CreateAssignmentForm
      key={`${id}-${assignmentId || "new"}`}
      id={id}
      assignmentId={assignmentId}
      classData={classData}
      initialAssignment={assignmentData}
      language={language}
      t={t}
    />
  )
}

export default CreateAssignmentPage
