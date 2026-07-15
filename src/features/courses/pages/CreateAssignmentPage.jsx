import React, { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import { useGetClassDetailQuery, useCreateAssignmentMutation } from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ReactDatePicker from "react-datepicker"
import "@/shared/styles/react-datepicker.css"
import {
  Calendar,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image,
  Upload,
  FileText,
  Trash2,
  ChevronDown,
  X,
  Check,
  ChevronRight
} from "lucide-react"

const CreateAssignmentPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const ca = c.createAssignment || {}

  // Fetch class details for dynamic breadcrumbs
  const { data: detailResponse, isLoading: isClassLoading } = useGetClassDetailQuery(id)
  const classData = detailResponse?.data || detailResponse || {}

  const [createAssignment] = useCreateAssignmentMutation()

  // Editor mock state
  const [editorText, setEditorText] = useState("")

  // Form States
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("23:59")
  const [allowLateSubmission, setAllowLateSubmission] = useState(true)

  // Date Parsing Helpers
  const toLocalDateString = (date) => {
    if (!date) return ""
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const parseLocalDateString = (str) => {
    if (!str) return null
    const [y, m, d] = str.split("-").map(Number)
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null
    return new Date(y, m - 1, d)
  }

  const toDueDateIso = () => {
    const date = parseLocalDateString(dueDate)
    if (!date || !dueTime) return null

    const [hours, minutes] = dueTime.split(":").map(Number)
    if (isNaN(hours) || isNaN(minutes)) return null

    date.setHours(hours, minutes, 0, 0)
    return date.toISOString()
  }

  const clampMaxFiles = (value) => Math.min(5, Math.max(1, Number(value) || 1))

  const buildAssignmentFormData = (status) => {
    const formData = new FormData()
    const dueDateIso = toDueDateIso()

    formData.append("name", title.trim() || "Bài tập chưa đặt tên")
    formData.append("description", editorText || "")
    if (dueDateIso) {
      formData.append("dueDate", dueDateIso)
    }
    formData.append("allowLateSubmission", allowLateSubmission)
    formData.append("allowFileSubmission", submissionTypeFile)
    formData.append("allowTextSubmission", submissionTypeText)
    formData.append("allowedFileTypes", allowedFileTypes.map(t => `.${t.toLowerCase()}`).join(","))
    formData.append("maxFiles", clampMaxFiles(maxFiles))
    formData.append("hasGrading", enableGrading)
    formData.append("maxScore", gradeScale === "scale100" ? 100 : 10)
    formData.append("releaseMode", resultRelease === "automatic" ? "Auto" : "Manual")
    formData.append("postToBulletinBoard", postToFeed)
    formData.append("status", status)

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
  const [submissionTypeFile, setSubmissionTypeFile] = useState(true)
  const [submissionTypeText, setSubmissionTypeText] = useState(false)
  const [allowedFileTypes, setAllowedFileTypes] = useState(["PDF", "DOCX"])
  const [maxFiles, setMaxFiles] = useState(1)
  const [enableGrading, setEnableGrading] = useState(false)
  const [gradeScale, setGradeScale] = useState("scale10") // scale10, scale100
  const [resultRelease, setResultRelease] = useState("manual") // manual, automatic
  const [publishStatus, setPublishStatus] = useState("now") // now, draft
  const [postToFeed, setPostToFeed] = useState(true)

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
      await createAssignment({ classId: id, formData: buildAssignmentFormData("Draft") }).unwrap()
      toast.success(ca.successDraft || "Đã lưu bản nháp bài nộp")
      navigate(`/workspace/courses/class/${id}`)
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.error?.message || "Lỗi khi lưu bản nháp bài nộp")
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
      await createAssignment({ classId: id, formData: buildAssignmentFormData(targetStatus) }).unwrap()
      toast.success(targetStatus === "Draft"
        ? (ca.successDraft || "Đã lưu bản nháp bài nộp")
        : (ca.successCreate || "Tạo bài nộp thành công!")
      )
      navigate(`/workspace/courses/class/${id}`)
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.error?.message || "Lỗi khi tạo bài nộp")
    }
  }

  if (isClassLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
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
          <span className="text-[#990011] font-semibold">{ca.pageTitle || "Tạo bài nộp"}</span>
        </div>
      </div>

      {/* ─── Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">{ca.pageTitle || "Tạo bài nộp"}</h1>

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
              <label className="text-sm font-bold text-gray-800">{ca.descriptionLabel || "Mô tả / Yêu cầu bài nộp"}</label>
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-red-100 focus-within:border-[#990011] transition-all">
                {/* Editor mock toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-2.5 flex flex-wrap items-center gap-3">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Bold">
                    <Bold size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Italic">
                    <Italic size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Underline">
                    <Underline size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Bullet List">
                    <List size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Numbered List">
                    <ListOrdered size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Insert Link">
                    <Link2 size={16} />
                  </button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-650 transition-colors" title="Insert Image">
                    <Image size={16} />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder={ca.descriptionPlaceholder || "Nhập hướng dẫn chi tiết cho học sinh..."}
                  className="w-full min-h-[160px] p-4 text-sm focus:outline-none resize-none"
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
              {attachedFiles.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
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
                          <span className="text-xs font-bold text-gray-800 leading-tight">
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
              {ca.btnCreate || "Tạo bài nộp"}
            </button>
          </div>
        </div>

      </form>

    </div>
  )
}

export default CreateAssignmentPage
