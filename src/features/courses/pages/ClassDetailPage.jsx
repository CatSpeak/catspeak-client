import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import {
  Calendar,
  Clock,
  GraduationCap,
  Globe,
  AlignLeft,
  User,
  BookOpen,
  MessageSquare,
  FileText,
  ChevronRight,
  Pencil,
  Tag,
  Users,
  Plus,
  Trash2,
  Bell,
  Upload,
  Download,
  X,
  Search,
  Video,
  ExternalLink,
  MoreVertical,
  Send
} from "lucide-react"

import {
  useGetClassDetailQuery,
  useGetStudentClassDetailQuery,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassMaterialsQuery,
  useUploadClassMaterialMutation,
  useDeleteClassMaterialMutation
} from "@/store/api/coursesApi"
import { useAuth } from "@/features/auth"
import { formatCurrency } from "../utils/courseUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.log(bytes) / Math.log(k)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getFileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || ""
  if (ext === "pdf") return <FileText className="text-rose-500" size={18} />
  if (["doc", "docx"].includes(ext)) return <FileText className="text-blue-500" size={18} />
  if (["xls", "xlsx"].includes(ext)) return <FileText className="text-emerald-500" size={18} />
  if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext)) return <FileText className="text-violet-500" size={18} />
  return <FileText className="text-gray-500" size={18} />
}

const ClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { role } = useAuth()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  const isStudent = role !== "Teacher"

  // Active Tab: "overview", "members", "feed", "grading", "materials"
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch Class Details conditionally via RTK Query
  const teacherDetail = useGetClassDetailQuery(id, { skip: isStudent })
  const studentDetail = useGetStudentClassDetailQuery(id, { skip: !isStudent })

  const { data: detailResponse, isLoading: isDetailLoading, error: detailError } = isStudent ? studentDetail : teacherDetail
  const [updateClass] = useUpdateClassMutation()
  const [deleteClass] = useDeleteClassMutation()

  // Materials API
  const { data: materialsResponse, isLoading: isMaterialsLoading } = useGetClassMaterialsQuery(id, {
    skip: activeTab !== "materials"
  })
  const [uploadMaterial, { isLoading: isUploading }] = useUploadClassMaterialMutation()
  const [deleteMaterial] = useDeleteClassMaterialMutation()

  // Process data for rendering
  const classData = detailResponse?.data || detailResponse || {}

  // State Management for UI Actions
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showCancelClassModal, setShowCancelClassModal] = useState(false)
  const [deleteMaterialData, setDeleteMaterialData] = useState(null)

  // Materials list states
  const [materialSearch, setMaterialSearch] = useState("")
  const [selectedUploadFile, setSelectedUploadFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Interactive local states for mocked tabs (API missing)
  const [studentsList, setStudentsList] = useState([
    { id: "s1", fullName: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0901234567", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s2", fullName: "Trần Thị B", email: "tranthib@gmail.com", phone: "0907654321", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s3", fullName: "Lê Hoàng C", email: "lehoangc@gmail.com", phone: "0912345678", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_EXCUSED" },
    { id: "s4", fullName: "Phạm Minh D", email: "phamminhd@gmail.com", phone: "0987654321", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_UNEXCUSED" },
    { id: "s5", fullName: "Hoàng Thị E", email: "hoangthie@gmail.com", phone: "0934567890", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s6", fullName: "Vũ Văn F", email: "vuvanf@gmail.com", phone: "0945678901", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s7", fullName: "Đặng Thị G", email: "dangthig@gmail.com", phone: "0956789012", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_EXCUSED" },
    { id: "s8", fullName: "Bùi Hoàng H", email: "buihoangh@gmail.com", phone: "0967890123", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s9", fullName: "Đỗ Thị I", email: "dothii@gmail.com", phone: "0978901234", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
    { id: "s10", fullName: "Ngô Văn K", email: "ngovank@gmail.com", phone: "0989012345", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" }
  ])

  const mockTeacher = {
    fullName: "John Doe",
    email: "johndoe@catspeak.edu.vn",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80&h=80"
  }

  const [feedPosts, setFeedPosts] = useState([
    {
      id: "f1",
      author: "John Doe",
      role: "Lead Instructor",
      time: "2 hours ago",
      content: "Xin chào cả lớp, buổi học hôm nay chúng ta sẽ ôn tập từ vựng chủ đề Travel. Các bạn nhớ chuẩn bị bài nhé!",
      commentsCount: 3,
      likes: 5,
      isLiked: false
    },
    {
      id: "f2",
      author: "John Doe",
      role: "Lead Instructor",
      time: "Yesterday",
      content: "Tài liệu học tập của buổi 3 đã được cập nhật ở tab Tài liệu. Các bạn tải về để làm bài tập về nhà.",
      commentsCount: 1,
      likes: 8,
      isLiked: true
    },
    {
      id: "f3",
      author: "John Doe",
      role: "Lead Instructor",
      time: "3 days ago",
      content: "Nhắc nhở: Hạn nộp bài tập speaking là tối mai. Các bạn lưu ý nộp đúng hạn để mình chấm điểm.",
      commentsCount: 5,
      likes: 12,
      isLiked: false
    }
  ])

  const [newPostText, setNewPostText] = useState("")

  const [gradingList, setGradingList] = useState([
    { id: "g1", studentName: "Nguyễn Văn A", title: "Homework Session 1", dueDate: "Due: Tomorrow", status: "Ungraded", grade: null },
    { id: "g2", studentName: "Trần Thị B", title: "Resubmission Request", dueDate: "Due: 3 more days", status: "Resubmitted", grade: null },
    { id: "g3", studentName: "Lê Hoàng C", title: "Homework Session 1", dueDate: "Due: Yesterday", status: "Graded", grade: 8.5 },
    { id: "g4", studentName: "Phạm Minh D", title: "Vocabulary Test 1", dueDate: "Due: 5 more days", status: "Ungraded", grade: null },
    { id: "g5", studentName: "Hoàng Thị E", title: "Homework Session 2", dueDate: "Due: Last week", status: "Graded", grade: 9.0 },
    { id: "g6", studentName: "Vũ Văn F", title: "Speaking Practice 1", dueDate: "Due: Yesterday", status: "Graded", grade: 10 }
  ])

  // Countdown timer calculation - mocks live ticking target 12d 9h 9m in the future on initial load
  const countdownTarget = useMemo(() => {
    const target = new Date()
    target.setDate(target.getDate() + 12)
    target.setHours(target.getHours() + 9)
    target.setMinutes(target.getMinutes() + 9)
    target.setSeconds(target.getSeconds() + 9)
    return target
  }, [])

  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = countdownTarget.getTime() - new Date().getTime()
      return diff > 0 ? Math.floor(diff / 1000) : 0
    }
    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [countdownTarget])

  const countdownTime = useMemo(() => {
    if (timeLeft <= 0) {
      return { days: "00", hours: "00", mins: "00" }
    }
    const days = Math.floor(timeLeft / (24 * 3600))
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600)
    const mins = Math.floor((timeLeft % 3600) / 60)
    return {
      days: days.toString().padStart(2, "0"),
      hours: hours.toString().padStart(2, "0"),
      mins: mins.toString().padStart(2, "0")
    }
  }, [timeLeft])

  // Date range formatter helper (e.g. Jan 15th - Feb 16th)
  const formatDateRange = (start, end) => {
    if (!start || !end) return "TBA"

    const parseDate = (dStr) => {
      const d = new Date(dStr)
      if (isNaN(d.getTime())) return dStr
      const day = d.getUTCDate()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[d.getUTCMonth()]

      const suffix = (dayNum) => {
        if (dayNum > 3 && dayNum < 21) return "th"
        switch (dayNum % 10) {
          case 1: return "st"
          case 2: return "nd"
          case 3: return "rd"
          default: return "th"
        }
      }
      return `${month} ${day}${suffix(day)}`
    }
    return `${parseDate(start)} - ${parseDate(end)}`
  }

  // Cancel class handler
  const handleCancelClass = async () => {
    try {
      await deleteClass(id).unwrap()
      toast.success(cd.toastCancelSuccess || "Class cancelled successfully");
      navigate("/workspace/courses");
    } catch {
      toast.error("Failed to cancel class");
    } finally {
      setShowCancelClassModal(false);
    }
  }

  // Materials handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedUploadFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedUploadFile) return
    try {
      await uploadMaterial({ classId: id, file: selectedUploadFile }).unwrap()
      setSelectedUploadFile(null)
      toast.success(cd.toastUploadSuccess || "Material uploaded successfully!")
    } catch {
      toast.error(cd.toastUploadFailed || "Failed to upload material!")
    }
  }

  const handleDeleteMaterial = async () => {
    if (!deleteMaterialData) return
    try {
      await deleteMaterial({ classId: id, materialId: deleteMaterialData.id }).unwrap()
      toast.success(cd.toastDeleteSuccess || "Material deleted successfully!")
    } catch {
      toast.error(cd.toastDeleteFailed || "Failed to delete material!")
    } finally {
      setDeleteMaterialData(null)
    }
  }

  const materialsList = materialsResponse?.data || materialsResponse || []
  const filteredMaterials = materialsList.filter(file => {
    const name = file.name || file.fileName || ""
    return name.toLowerCase().includes(materialSearch.toLowerCase())
  })

  // Local state update handlers for mock features
  const handleUpdateAttendance = (studentId, newAttendance) => {
    setStudentsList(prev => prev.map(s => s.id === studentId ? { ...s, attendance: newAttendance } : s))
    const attendStr = newAttendance === 'PRESENT' ? 'Có mặt' : newAttendance === 'ABSENT_EXCUSED' ? 'Vắng có phép' : 'Vắng không phép'
    toast.success(language === "vi" ? `Đã điểm danh: ${attendStr}` : `Attendance updated: ${newAttendance}`)
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newPostText.trim()) return
    const newPost = {
      id: `f_${Date.now()}`,
      author: mockTeacher.fullName,
      role: "Lead Instructor",
      time: "Just now",
      content: newPostText,
      commentsCount: 0,
      likes: 0,
      isLiked: false
    }
    setFeedPosts([newPost, ...feedPosts])
    setNewPostText("")
    toast.success(cd.postPublished || "Đã đăng bảng tin thành công!")
  }

  const handleGradeSubmission = (itemId) => {
    const item = gradingList.find(i => i.id === itemId)
    if (!item) return
    const gradeInput = prompt(language === "vi" ? `Nhập điểm cho ${item.studentName} (0 - 10):` : `Enter grade for ${item.studentName} (0 - 10):`, "10")
    if (gradeInput === null) return
    const parsedGrade = parseFloat(gradeInput)
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      toast.error(language === "vi" ? "Điểm số không hợp lệ. Vui lòng nhập từ 0 đến 10" : "Invalid grade. Please enter between 0 and 10")
      return
    }
    setGradingList(prev => prev.map(i => i.id === itemId ? { ...i, status: "Graded", grade: parsedGrade } : i))
    toast.success(language === "vi" ? "Đã chấm điểm thành công!" : "Graded successfully!")
  }

  if (isDetailLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (detailError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading class detail: {detailError.data?.message || detailError.message || "Class not found"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{language === "vi" ? "Toàn bộ khóa học" : "All Courses"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classData.courseId || ""}`)}>{language === "vi" ? "Chi tiết khóa học" : "Course Details"}</span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">{language === "vi" ? "Chi tiết lớp học" : "Class Details"}</span>
      </div>

      {/* ─── Page Heading & Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {language === "vi" ? "Chi tiết lớp học" : "Class Details"}
        </h1>

        <div className="flex items-center gap-3">
          {/* Trò chuyện button */}
          <button
            onClick={() => toast.success("Opening chat...")}
            className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <MessageSquare size={14} className="fill-white" />
            <span>{language === "vi" ? "Trò chuyện" : "Chat"}</span>
          </button>

          {/* Tạo bài + button (Hidden for students) */}
          {!isStudent && (
            <button
              onClick={() => setActiveTab("feed")}
              className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <span>{language === "vi" ? "Tạo bài" : "Create Post"}</span>
              <span className="text-sm font-light">+</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex border-b border-gray-150 pb-px gap-8 text-sm font-bold text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition-all relative ${activeTab === "overview"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {language === "vi" ? "Tổng quan" : "Overview"}
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 transition-all relative ${activeTab === "members"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {isStudent
            ? (language === "vi" ? "Bạn học" : "Classmates")
            : (language === "vi" ? "Quản lý thành viên" : "Members")}
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "feed"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>{language === "vi" ? "Bảng tin" : "Feed"}</span>
          <span className="bg-[#EAB308] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0">12</span>
        </button>

        <button
          onClick={() => setActiveTab("grading")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "grading"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>
            {isStudent
              ? (language === "vi" ? "Điểm số của tôi" : "My Grades")
              : (language === "vi" ? "Chấm điểm & quản lý" : "Grading & Management")}
          </span>
          {!isStudent && (
            <span className="bg-[#EAB308] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shrink-0">12</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`pb-3 transition-all relative ${activeTab === "materials"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {cd.materials || (language === "vi" ? "Tài liệu học tập" : "Materials")}
        </button>
      </div>

      {/* ─── Tab Contents ─── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Visual Banner, Information Details, and Circular Progress */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* ─── Visual Banner ─── */}
            <div
              className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm text-white"
            >
              {/* Background image & dark overlay container wrapper to prevent dropdown clipping */}
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden z-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${classData.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
                {/* Class Title */}
                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
                  {classData.title || "English for newbie 1-0-2"}
                </h2>

                {/* Actions Trigger / Tùy chỉnh button (Hidden for students) */}
                {!isStudent && (
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                      className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
                    >
                      <Pencil size={14} />
                      <span>{language === "vi" ? "Tùy chỉnh" : "Customize"}</span>
                    </button>

                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 text-gray-700">
                        <button
                          onClick={() => {
                            setShowActionsDropdown(false)
                            navigate(`/workspace/courses/edit-class/${id}`)
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 text-xs font-bold transition-colors"
                        >
                          {language === "vi" ? "Chỉnh sửa lớp" : "Edit Class"}
                        </button>
                        <button
                          onClick={async () => {
                            setShowActionsDropdown(false);
                            try {
                              await updateClass({ id, data: { status: "COMPLETED" } }).unwrap()
                              toast.success(cd.toastCompleteSuccess || "Marked class as complete");
                            } catch {
                              toast.error("Failed to complete class");
                            }
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 text-xs font-bold transition-colors"
                        >
                          {language === "vi" ? "Hoàn thành lớp học" : "Complete Class"}
                        </button>
                        <button
                          onClick={() => {
                            setShowActionsDropdown(false);
                            setShowCancelClassModal(true);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 text-xs font-bold text-red-600 transition-colors"
                        >
                          {language === "vi" ? "Hủy lớp học" : "Cancel Class"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Opening Fee Card ─── */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center font-black text-lg">
                  $
                </div>
                <span className="text-sm font-extrabold text-gray-500">{language === "vi" ? "Phí mở lớp" : "Class Fee"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xl font-black text-[#990011]">
                <span>{classData.tuitionFee ? `${formatCurrency(classData.tuitionFee)} VNĐ` : "350.000 VNĐ"}</span>
                <span className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help shrink-0 font-medium" title="Phí mở lớp học">?</span>
              </div>
            </div>

            {/* ─── Information Card Grid ─── */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Ngôn ngữ */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Ngôn ngữ" : "Language"}</span>
                    <span className="text-gray-900 font-extrabold text-sm mt-0.5">{classData.language || "English"}</span>
                  </div>
                </div>

                {/* Trình độ */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Trình độ" : "Level"}</span>
                    <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#EAB308] rounded-full w-fit">
                      {classData.levels?.join(", ") || "B2"}
                    </span>
                  </div>
                </div>

                {/* Thời gian tuyển sinh */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Thời gian tuyển sinh" : "Admission Period"}</span>
                    <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                      {classData.enrollmentStart && classData.enrollmentEnd
                        ? formatDateRange(classData.enrollmentStart, classData.enrollmentEnd)
                        : "Oct 24, 2026 - Jan 30, 2027"}
                    </span>
                  </div>
                </div>

                {/* Lịch học */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Lịch học" : "Schedule Period"}</span>
                    <span className="text-gray-900 font-extrabold text-sm mt-0.5">
                      {classData.startDate && classData.endDate
                        ? formatDateRange(classData.startDate, classData.endDate)
                        : "Nov 1, 2026 - Jan 30, 2027"}
                    </span>
                  </div>
                </div>

                {/* Sĩ số lớp */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Sĩ số lớp" : "Class Size"}</span>
                    <span className="text-gray-900 font-extrabold text-sm mt-0.5">{classData.slots || 30} {language === "vi" ? "người" : "people"}</span>
                  </div>
                </div>

                {/* Mã ID */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                    <Tag size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Mã ID" : "Class ID"}</span>
                    <span className="text-gray-900 font-extrabold text-sm mt-0.5">{classData.id || "1234.5678.9012"}</span>
                  </div>
                </div>

              </div>

              {/* Mô tả */}
              <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                  <AlignLeft size={18} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-bold">{language === "vi" ? "Mô tả" : "Description"}</span>
                  <p className="text-gray-600 font-medium text-xs leading-relaxed mt-0.5">
                    {classData.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Teaching Progress Circular Chart ─── */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
              <h3 className="text-xl font-black text-gray-950 tracking-tight">
                {language === "vi" ? "Tiến độ giảng dạy" : "Teaching Progress"}
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-4 px-2">
                {/* SVG Progress Ring using react-circular-progressbar */}
                <div className="relative w-60 h-60 flex items-center justify-center shrink-0">
                  <CircularProgressbar
                    value={25}
                    strokeWidth={8}
                    styles={buildStyles({
                      pathColor: "#990011",
                      trailColor: "#E5E7EB",
                      strokeLinecap: "round"
                    })}
                  />
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-gray-950 leading-none">25%</span>
                    <span className="text-sm font-black text-gray-800 mt-2.5">4 / 12</span>
                    <span className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                      {language === "vi" ? "Buổi hoàn thành" : "Session completed"}
                    </span>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex flex-col justify-center gap-4 flex-1 max-w-sm w-full">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#990011] shrink-0" />
                    <span>{language === "vi" ? "Bài đã hoàn thành" : "Completed sessions"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#9CA3AF] shrink-0" />
                    <span>{language === "vi" ? "Bài chưa hoàn thành" : "Uncompleted sessions"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Upcoming session and Teaching tasks */}
          <div className="flex flex-col gap-8">

            {/* Buổi dạy tiếp theo */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
              <h3 className="text-lg font-black text-gray-950 tracking-tight">
                {language === "vi" ? "Buổi dạy tiếp theo" : "Upcoming Session"}
              </h3>

              {/* Countdown Ticker */}
              <div className="flex justify-around items-center text-center py-3 border-b border-gray-100 select-none">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.days}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Days</span>
                </div>
                <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.hours}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Hours</span>
                </div>
                <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.mins}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Mins</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    China
                  </span>
                  <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    B2
                  </span>
                  <span className="ml-auto bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                    Teaching
                  </span>
                </div>

                {/* Class Title */}
                <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
                  {classData.title || "Lớp tiếng anh luyện nói"}
                </h4>

                {/* Date / Time */}
                <div className="flex flex-col gap-2 border-b border-gray-50 pb-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>11:45 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>31st Jul</span>
                  </div>
                </div>

                {/* Footer stack and Join button */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                        alt="Student"
                      />
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                        alt="Student"
                      />
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80"
                        alt="Student"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 font-sans">10</span>
                  </div>

                  <button
                    onClick={() => {
                      toast.success(cd.toastRouting || "Routing to virtual classroom...");
                      setTimeout(() => {
                        navigate(`/${language}/meet/class-${id}`);
                      }, 1000);
                    }}
                    className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                  >
                    <span>{language === "vi" ? "Vào phòng" : "Join room"}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Việc giảng dạy */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-950 tracking-tight">
                  {language === "vi" ? "Việc giảng dạy" : "Teaching Tasks"}
                </h3>
                <button
                  onClick={() => setActiveTab("grading")}
                  className="text-xs font-black text-[#b20a1c] hover:underline"
                >
                  {language === "vi" ? "Xem tất cả" : "View all"}
                </button>
              </div>

              {/* List of Tasks */}
              <div className="flex flex-col gap-4">

                {/* Task 1 */}
                <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-950 truncate leading-snug">
                      {language === "vi" ? "Chấm bài tập" : "Grade homework"}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Due: Tomorrow</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>11:45 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>31st Jul, 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] px-2 py-0.5 rounded">
                      Urgent
                    </span>
                    <div
                      onClick={() => setActiveTab("grading")}
                      className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
                    >
                      <Plus size={12} />
                    </div>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#FAF5FF] text-[#A855F7] flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-950 truncate leading-snug">
                      {language === "vi" ? "Đưa feedback" : "Give feedback"}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Due: 3 more days</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>11:45 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>31st Jul, 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2 py-0.5 rounded">
                      Required
                    </span>
                    <div
                      onClick={() => setActiveTab("grading")}
                      className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
                    >
                      <Plus size={12} />
                    </div>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-950 truncate leading-snug">
                      {language === "vi" ? "Đưa feedback" : "Give feedback"}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Lớp viết anh ngữ chuyên n...</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>11:45 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>31st Jul</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] px-2 py-0.5 rounded">
                      Urgent
                    </span>
                    <div
                      onClick={() => setActiveTab("grading")}
                      className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
                    >
                      <Plus size={12} />
                    </div>
                  </div>
                </div>

                {/* Task 4 */}
                <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-950 truncate leading-snug">
                      {language === "vi" ? "Soạn giáo án" : "Prepare lesson plan"}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Due: 5 more days</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>11:45 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>31st Jul, 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className="bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2 py-0.5 rounded">
                      Later
                    </span>
                    <div
                      onClick={() => setActiveTab("grading")}
                      className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
                    >
                      <Plus size={12} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── Quản lý thành viên (Members Tab) ─── */}
      {activeTab === "members" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5">
              {language === "vi" ? "GIẢNG VIÊN CHÍNH" : "LEAD INSTRUCTOR"}
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden text-gray-700 font-black text-sm flex items-center justify-center shadow-xs">
                  <img className="w-full h-full object-cover" src={mockTeacher.avatar} alt={mockTeacher.fullName} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-800">{mockTeacher.fullName}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{language === "vi" ? "Giảng viên chính" : "Lead Instructor"}</span>
                </div>
              </div>

              {!isStudent && (
                <button
                  onClick={() => toast.success(`Send private message to ${mockTeacher.fullName}`)}
                  className="h-8 px-4 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  <span>{language === "vi" ? "Nhắn tin" : "Message"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                {language === "vi" ? `HỌC VIÊN (${studentsList.length} / 30)` : `STUDENTS (${studentsList.length} / 30)`}
              </h3>
              {!isStudent && (
                <button
                  onClick={() => toast.success("Invite code copied to clipboard")}
                  className="text-xs text-[#990011] font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={13} />
                  <span>{language === "vi" ? "Mời học viên" : "Invite Student"}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {studentsList.map((student) => (
                <div key={student.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 text-white font-black text-xs flex items-center justify-center shadow-xs overflow-hidden">
                      <img className="w-full h-full object-cover" src={student.avatar} alt={student.fullName} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-gray-800">{student.fullName}</span>
                      <span className="text-[10px] text-gray-450 font-semibold">
                        {isStudent ? "student@catspeak.edu.vn" : `${student.email} • ${student.phone}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {isStudent ? (
                        <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${
                          student.attendance === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" :
                          student.attendance === "ABSENT_EXCUSED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {student.attendance === "PRESENT" ? (language === "vi" ? "Có mặt" : "Present") :
                           student.attendance === "ABSENT_EXCUSED" ? (language === "vi" ? "Vắng có phép" : "Absent (Excused)") :
                           (language === "vi" ? "Vắng không phép" : "Absent (Unexcused)")}
                        </span>
                      ) : (
                        <select
                          value={student.attendance || "PRESENT"}
                          onChange={(e) => handleUpdateAttendance(student.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer pr-6 transition-all ${student.attendance === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" :
                            student.attendance === "ABSENT_EXCUSED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 6px center",
                            backgroundSize: "8px"
                          }}
                        >
                          <option value="PRESENT">{language === "vi" ? "Có mặt" : "Present"}</option>
                          <option value="ABSENT_EXCUSED">{language === "vi" ? "Vắng có phép" : "Absent (Excused)"}</option>
                          <option value="ABSENT_UNEXCUSED">{language === "vi" ? "Vắng không phép" : "Absent (Unexcused)"}</option>
                        </select>
                      )}
                    </div>

                    {!isStudent && (
                      <>
                        <button
                          onClick={() => toast.success(`Messaging ${student.fullName}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setStudentsList(prev => prev.filter(s => s.id !== student.id))
                            toast.success(`Removed student ${student.fullName}`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                          title="Remove from class"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Bảng tin (Feed Tab) ─── */}
      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Create Post Form (Hidden for students) */}
            {!isStudent && (
              <form onSubmit={handleCreatePost} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                <textarea
                  rows={3}
                  placeholder={language === "vi" ? "Chia sẻ tin tức, tài liệu học tập với lớp..." : "Share announcements, links, study resources..."}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all resize-none placeholder:text-gray-400"
                />
                <div className="flex justify-between items-center border-t border-gray-50 pt-2">
                  <span className="text-[10px] text-gray-400 font-bold">{language === "vi" ? "Đăng với tư cách giảng viên" : "Posting as Instructor"}</span>
                  <button
                    type="submit"
                    className="h-8 px-4 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                  >
                    <Send size={12} />
                    <span>{language === "vi" ? "Đăng bài" : "Publish"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of feed items */}
            <div className="flex flex-col gap-3">
              {feedPosts.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-150 text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200">
                        {item.author[0]}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-gray-800">{item.author}</span>
                          <span className="bg-red-50 text-[#990011] text-[8px] font-black px-1.5 py-0.5 rounded">
                            {item.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold">{item.time}</span>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {item.content}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-2 mt-1">
                    <button
                      onClick={() => {
                        setFeedPosts(prev => prev.map(p => p.id === item.id ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p))
                        toast.success(item.isLiked ? "Unliked post" : "Liked post")
                      }}
                      className={`hover:text-[#990011] transition-colors ${item.isLiked ? "text-[#990011]" : ""}`}
                    >
                      Like ({item.likes})
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => toast.success("Opening comments...")}
                      className="hover:text-[#990011] transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={11} />
                      Comment ({item.commentsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Side Announcements widgets */}
          <div className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-fit">
            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest border-b border-gray-50 pb-1.5">
              {language === "vi" ? "Thông báo lớp học" : "Class Announcements"}
            </h4>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <div className="p-2.5 bg-yellow-50/40 border border-yellow-100 rounded-xl text-yellow-800">
                <span className="font-extrabold block mb-0.5">Quiz Notice:</span>
                Vocabulary quiz is scheduled on Next Monday. Make sure to complete revisions.
              </div>
              <div className="p-2.5 bg-purple-50/40 border border-purple-100 rounded-xl text-purple-800">
                <span className="font-extrabold block mb-0.5">Project Upload:</span>
                Submit your self-intro project PDF onto materials panel.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── Chấm điểm & quản lý (Grading Tab) ─── */}
      {activeTab === "grading" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                {isStudent
                  ? (language === "vi" ? "Kết quả học tập & Bảng điểm" : "My Grades & Submissions")
                  : (language === "vi" ? "Quản lý & Chấm điểm bài tập" : "Assignment Grading & Submissions")}
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-extrabold uppercase tracking-wider">
                  {!isStudent && <th className="p-3">Student</th>}
                  <th className="p-3">Assignment</th>
                  <th className="p-3">Due Status</th>
                  <th className="p-3">Grading Status</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {gradingList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {!isStudent && <td className="p-3 font-extrabold text-gray-800">{item.studentName}</td>}
                    <td className="p-3 font-bold text-gray-650">{item.title}</td>
                    <td className="p-3 text-gray-400 font-semibold">{item.dueDate}</td>
                    <td className="p-3">
                      {item.status === "Ungraded" && (
                        <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100">
                          {isStudent ? (language === "vi" ? "Chưa nộp" : "Not Submitted") : (language === "vi" ? "Cần chấm điểm" : "Needs Grading")}
                        </span>
                      )}
                      {item.status === "Resubmitted" && (
                        <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-100">
                          {isStudent ? (language === "vi" ? "Chờ chấm điểm" : "Pending Grading") : (language === "vi" ? "Đã nộp lại" : "Resubmitted")}
                        </span>
                      )}
                      {item.status === "Graded" && (
                        <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {language === "vi" ? "Đã chấm điểm" : "Graded"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-black text-gray-900">
                      {item.grade !== null ? item.grade : "—"}
                    </td>
                    <td className="p-3 text-center">
                      {isStudent ? (
                        item.status === "Ungraded" ? (
                          <button
                            onClick={() => {
                              toast.success(language === "vi" ? "Đã nộp bài tập thành công!" : "Homework submitted successfully!")
                            }}
                            className="h-7 px-3 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                          >
                            {language === "vi" ? "Nộp bài" : "Submit"}
                          </button>
                        ) : item.status === "Resubmitted" ? (
                          <button
                            onClick={() => toast.success(language === "vi" ? "Đã nộp lại bài tập thành công!" : "Homework resubmitted successfully!")}
                            className="h-7 px-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                          >
                            {language === "vi" ? "Nộp lại" : "Resubmit"}
                          </button>
                        ) : (
                          <button
                            onClick={() => toast.success(language === "vi" ? "Xem nhận xét của giảng viên..." : "Reviewing teacher feedback...")}
                            className="h-7 px-3 bg-gray-100 hover:bg-gray-150 text-gray-600 font-bold text-[10px] rounded-lg transition-all"
                          >
                            {language === "vi" ? "Xem nhận xét" : "View feedback"}
                          </button>
                        )
                      ) : (
                        item.status !== "Graded" ? (
                          <button
                            onClick={() => handleGradeSubmission(item.id)}
                            className="h-7 px-3 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                          >
                            Grade
                          </button>
                        ) : (
                          <button
                            onClick={() => toast.success("Reviewing feedback details")}
                            className="h-7 px-3 bg-gray-100 hover:bg-gray-150 text-gray-600 font-bold text-[10px] rounded-lg transition-all"
                          >
                            View feedback
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Tài liệu học tập (Materials Tab) ─── */}
      {activeTab === "materials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

          {/* LEFT/MAIN COLUMN: Materials List (Full width for student) */}
          <div className={`${isStudent ? "lg:col-span-3" : "lg:col-span-2"} flex flex-col gap-4`}>

            {/* Header and Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                  {cd.materialsList || "Danh sách tài liệu"}
                </h3>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder={cd.searchMaterials || "Tìm tài liệu..."}
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* List of files */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3 min-h-[300px]">
              {isMaterialsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]" />
                  <span className="text-xs font-bold text-gray-400">
                    {cd.loadingMaterials || "Đang tải..."}
                  </span>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">
                    {cd.noMaterials || "Chưa có tài liệu"}
                  </h4>
                  <p className="text-xs font-semibold text-gray-400 max-w-[280px]">
                    {cd.startUploading || "Tải tài liệu lên ngay!"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {filteredMaterials.map((file) => {
                    const fileName = file.name || file.fileName || "Unnamed file"
                    const fileUrl = file.url || file.fileUrl || ""
                    const fileSize = file.size || file.fileSize || 0
                    const fileDate = file.createdAt || file.uploadedAt || ""

                    return (
                      <div key={file.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-gray-50/30 px-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          {getFileIcon(fileName)}
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800 break-all max-w-[200px] md:max-w-md">
                              {fileName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-1">
                              <span>{formatFileSize(fileSize)}</span>
                              <span>•</span>
                              <span>{fileDate ? new Date(fileDate).toLocaleDateString("en-GB", { timeZone: "UTC" }) : ""}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-xl transition-all"
                              title="Download File"
                            >
                              <Download size={15} />
                            </a>
                          )}
                          {!isStudent && (
                            <button
                              onClick={() => {
                                setDeleteMaterialData(file);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete File"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Upload Panel (Hidden for students) */}
          {!isStudent && (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
                  <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
                  <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                    {cd.uploadMaterial || "Tải lên tài liệu"}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive
                      ? "border-[#990011] bg-[#990011]/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/55"
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload-input").click()}
                  >
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#990011] mb-3">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      {cd.selectFile || "Chọn tệp tin hoặc kéo thả"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-1">
                      Support PDF, DOCX, XLSX, images (Max 15MB)
                    </span>
                  </div>

                  {selectedUploadFile && (
                    <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {getFileIcon(selectedUploadFile.name)}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold text-gray-850 truncate max-w-[150px]">
                            {selectedUploadFile.name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold">
                            {formatFileSize(selectedUploadFile.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUploadFile(null)}
                        className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!selectedUploadFile || isUploading}
                    onClick={handleUploadSubmit}
                    className="w-full h-10 bg-[#990011] hover:bg-[#80000e] disabled:bg-gray-200 text-white disabled:text-gray-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>{cd.uploadNow || "Tải lên ngay"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showCancelClassModal}
        onClose={() => setShowCancelClassModal(false)}
        onConfirm={handleCancelClass}
        title="Cancel Class"
        message={cd.confirmCancelClass || "Bạn có chắc chắn muốn hủy lớp học này?"}
        confirmText="Cancel Class"
        cancelText={c.createClass?.cancel || "Hủy"}
      />

      <ConfirmationModal
        open={!!deleteMaterialData}
        onClose={() => setDeleteMaterialData(null)}
        onConfirm={handleDeleteMaterial}
        title="Delete Material"
        message={cd.confirmDeleteMaterial || "Bạn có chắc chắn muốn xóa tài liệu này?"}
        confirmText="Delete"
        cancelText={c.createClass?.cancel || "Hủy"}
      />
    </div>
  )
}

export default ClassDetailPage
