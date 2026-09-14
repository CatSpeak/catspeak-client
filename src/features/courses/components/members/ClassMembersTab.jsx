import React, { useState, useMemo, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"
import {
  getSafeMediaUrl,
  getMemberDisplayName,
  getMemberId,
  getMemberEmail,
  getMemberAvatar,
} from "../../utils/courseUtils"
import ClassMemberFriendButton from "./ClassMemberFriendButton"
import { EmptyState } from "@/shared/components/ui/indicators"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import CoHostModal from "@/features/co-host/CoHostModal"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"
import {
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Users,
  UserPlus,
  Search,
  SearchX,
  X,
  ArrowDownZA,
  ArrowUpZA,
  Crown,
  MessageSquare,
  GraduationCap,
  SlidersHorizontal,
} from "lucide-react"

const getPersonId = (person) => getMemberId(person)

const getPersonName = (person) => getMemberDisplayName(person)

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return "—"
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase()
}

// Palette màu ngẫu nhiên nhưng ổn định theo ID/Tên giúp avatar chữ sinh động
const AVATAR_PALETTES = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-violet-100 text-violet-800 border-violet-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-teal-100 text-teal-800 border-teal-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
]

const getAvatarPalette = (key) => {
  if (!key) return AVATAR_PALETTES[0]
  let hash = 0
  const str = String(key)
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

const normalizeSearchText = (str) => {
  if (!str) return ""
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

const ATTENDANCE_MAP = {
  PRESENT: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    getKey: (cd) => cd.present || "Có mặt",
  },
  ABSENT_EXCUSED: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    getKey: (cd) => cd.absentExcused || "Vắng có phép",
  },
  ABSENT_UNEXCUSED: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
    getKey: (cd) => cd.absentUnexcused || "Vắng không phép",
  },
}

const getRoleBadge = (role, cd = {}, studentLabel = "Học viên") => {
  if (!role || typeof role !== "string") return null
  const normalized = role.trim().toLowerCase()
  if (normalized === "teacher" || normalized === "instructor") {
    return {
      label: cd.leadInstructorLabel || "Giảng viên",
      className: "bg-red-50 text-[#990011] border-red-100",
    }
  }
  if (normalized === "assistant" || normalized === "ta") {
    return {
      label: cd.assistantLabel || "Trợ giảng",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    }
  }
  if (normalized === "student" || normalized === "member") {
    return {
      label: studentLabel,
      className: "bg-gray-100 text-gray-700 border-gray-200",
    }
  }
  return {
    label: role,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  }
}

const ClassMembersTab = ({
  classData,
  isStudent = false,
  isClassTeacher = false,
  coHost = null,
  coHostCandidates = [],
  isSavingCoHost = false,
  isRevokingCoHost = false,
  onAssignCoHost,
  onUpdateCoHost,
  onRevokeCoHost,
  onInviteStudents,
}) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)
  const [createPrivateConversation] = useCreatePrivateConversationMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [messagingId, setMessagingId] = useState(null)

  // Co-host modal states
  const [coHostModalOpen, setCoHostModalOpen] = useState(false)
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false)
  const [revokeSuccessOpen, setRevokeSuccessOpen] = useState(false)

  const c = t.courses || {}
  const cd = c.classDetail || {}
  const scd = c.studentCourseDetail || {}
  const classWorkspace = c.classWorkspace || {}
  const roomsCoHost = t.rooms?.coHost || {}

  const currentUserId = user?.accountId ?? user?.id ?? user?.userId
  const isOwnAccount = (targetId) => {
    if (!currentUserId || !targetId) return false
    return Number(currentUserId) === Number(targetId)
  }

  // Normalize co-host data (from prop or embedded classData)
  const effectiveCoHost = coHost ?? classData?.coHost ?? null
  const hasCoHost = effectiveCoHost?.coHostAccountId != null
  const initialAccountId = effectiveCoHost?.coHostAccountId ?? null
  const initialPermissions = useMemo(
    () => effectiveCoHost?.permissions ?? [],
    [effectiveCoHost],
  )

  const teacher = useMemo(() => {
    const nestedTeacher = classData?.teacher ?? classData?.instructor
    if (nestedTeacher && typeof nestedTeacher === "object") {
      return {
        ...nestedTeacher,
        id: getPersonId(nestedTeacher),
        name: getPersonName(nestedTeacher),
        avatar: getMemberAvatar(nestedTeacher),
        email: getMemberEmail(nestedTeacher),
        phone:
          nestedTeacher.phone ??
          nestedTeacher.Phone ??
          nestedTeacher.phoneNumber ??
          nestedTeacher.studentPhone ??
          "",
      }
    }

    const name = String(
      classData?.teacherName ?? classData?.instructorName ?? "",
    ).trim()
    if (!name) return null

    return {
      id: classData?.teacherId ?? classData?.instructorId,
      name,
      avatar: classData?.teacherAvatar ?? classData?.instructorAvatar,
      email: classData?.teacherEmail ?? classData?.instructorEmail,
      phone: classData?.teacherPhone ?? classData?.instructorPhone,
    }
  }, [classData])

  const students = useMemo(() => {
    const candidates =
      [classData?.students, classData?.members, classData?.enrollments].find(
        Array.isArray,
      ) ?? []
    const seenIds = new Set()
    const teacherId = teacher?.id ? String(teacher.id) : null

    return candidates.filter((person) => {
      if (!person || typeof person !== "object") return false

      const id = getPersonId(person)
      const name = getPersonName(person)
      if ((id === undefined || id === null) && !name) return false

      const personIdStr = id !== undefined && id !== null ? String(id) : null
      const role = String(person.role ?? "").toLowerCase()
      if (
        teacherId &&
        personIdStr === teacherId &&
        (role === "teacher" || role === "instructor")
      ) {
        return false
      }

      const key = personIdStr
        ? `id:${personIdStr}`
        : `name:${name.toLocaleLowerCase()}`
      if (seenIds.has(key)) return false
      seenIds.add(key)
      return true
    })
  }, [classData, teacher])

  // Resolve assigned co-host info from candidates or student roster
  const assignedCoHostCandidate = useMemo(() => {
    if (!hasCoHost) return null
    return (
      coHostCandidates.find(
        (cand) => String(cand.accountId) === String(effectiveCoHost.coHostAccountId),
      ) ?? null
    )
  }, [coHostCandidates, effectiveCoHost, hasCoHost])

  const assignedCoHostStudent = useMemo(() => {
    if (!hasCoHost) return null
    return (
      students.find(
        (s) => String(getPersonId(s)) === String(effectiveCoHost.coHostAccountId),
      ) ?? null
    )
  }, [students, effectiveCoHost, hasCoHost])

  const coHostName =
    assignedCoHostCandidate?.name ||
    getPersonName(assignedCoHostStudent) ||
    effectiveCoHost?.coHostName ||
    effectiveCoHost?.name ||
    ""
  const coHostAvatar = getSafeMediaUrl(
    assignedCoHostStudent?.avatar ||
      assignedCoHostStudent?.avatarUrl ||
      effectiveCoHost?.avatar ||
      effectiveCoHost?.avatarUrl,
  )
  const coHostEmail =
    assignedCoHostCandidate?.email ||
    getMemberEmail(assignedCoHostStudent) ||
    effectiveCoHost?.email ||
    ""
  const coHostPhone =
    assignedCoHostStudent?.phone ??
    assignedCoHostStudent?.Phone ??
    assignedCoHostStudent?.phoneNumber ??
    ""
  const coHostAccountId = effectiveCoHost?.coHostAccountId

  // Co-host actions handlers
  const handleCoHostSubmit = async ({ coHostAccountId: selectedId, permissions }) => {
    try {
      if (hasCoHost) {
        const samePerson =
          String(effectiveCoHost?.coHostAccountId) === String(selectedId)
        if (samePerson) {
          await onUpdateCoHost?.({ permissions })
          toast.success(roomsCoHost.permissionsUpdated || "Đã cập nhật quyền Co-host.")
        } else {
          await onAssignCoHost?.({ coHostAccountId: selectedId, permissions })
          toast.success(roomsCoHost.replaced || "Đã thay thế Co-host.")
        }
      } else {
        await onAssignCoHost?.({ coHostAccountId: selectedId, permissions })
        toast.success(roomsCoHost.assigned || "Đã phân công Co-host.")
      }
      setCoHostModalOpen(false)
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          err?.data?.message || roomsCoHost.assignError || "Không thể phân công Co-host. Vui lòng thử lại.",
        ),
      )
    }
  }

  const handleCoHostRevoke = async () => {
    try {
      await onRevokeCoHost?.()
      setConfirmRevokeOpen(false)
      setCoHostModalOpen(false)
      setRevokeSuccessOpen(true)
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          err?.data?.message || roomsCoHost.revokeError || "Không thể gỡ Co-host. Vui lòng thử lại.",
        ),
      )
    }
  }

  // Count metrics
  const capacityValue = Number(classData?.capacity ?? classData?.slots)
  const capacity =
    Number.isFinite(capacityValue) && capacityValue >= 0
      ? Math.floor(capacityValue)
      : null
  const fillRate =
    capacity && capacity > 0
      ? Math.min(100, Math.round((students.length / capacity) * 100))
      : null
  const remainingSlots =
    capacity !== null ? Math.max(0, capacity - students.length) : null

  // Filter & Search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const query = normalizeSearchText(searchQuery)
    return students.filter((student) => {
      const name = normalizeSearchText(getPersonName(student))
      const email = normalizeSearchText(getMemberEmail(student))
      const phone = normalizeSearchText(
        student.phone ??
          student.Phone ??
          student.phoneNumber ??
          student.studentPhone ??
          student.StudentPhone ??
          "",
      )
      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      )
    })
  }, [students, searchQuery])

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents]
    if (!sortOrder) return list

    return list.sort((a, b) => {
      const nameA = getPersonName(a)
      const nameB = getPersonName(b)
      const comp = nameA.localeCompare(nameB, "vi", { sensitivity: "base" })
      return sortOrder === "asc" ? comp : -comp
    })
  }, [filteredStudents, sortOrder])

  const studentRoleLabel = t.header?.studentRole || "Học viên"
  const sortLabel =
    sortOrder === "asc"
      ? cd.sortDesc || "Sắp xếp giảm dần theo tên (Z-A)"
      : cd.sortAsc || "Sắp xếp tăng dần theo tên (A-Z)"
  const viewProfileLabel = cd.viewProfile || "Xem hồ sơ"

  const teacherName = getPersonName(teacher)
  const teacherAvatar = getSafeMediaUrl(teacher?.avatar ?? teacher?.avatarUrl)

  const handleProfileNavigate = (personId) => {
    if (personId) {
      navigate(`/profile/${personId}`)
    }
  }

  const handlePersonKeyDown = (personId) => (event) => {
    if (!personId) return
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar"
    ) {
      event.preventDefault()
      handleProfileNavigate(personId)
    }
  }

  const handleStartChat = async (targetAccountId, e) => {
    e?.stopPropagation?.()
    if (!targetAccountId) return

    if (!isAuthenticated) {
      if (authModalCtx?.openAuthModal) {
        authModalCtx.openAuthModal("login", window.location.pathname)
      } else {
        toast.error(
          c.student?.loginToEnroll || "Vui lòng đăng nhập để nhắn tin.",
        )
      }
      return
    }

    if (isOwnAccount(targetAccountId)) return

    try {
      setMessagingId(targetAccountId)
      const conversation =
        await createPrivateConversation(targetAccountId).unwrap()
      const convId =
        conversation?.id ??
        conversation?.conversationId ??
        conversation?.data?.id
      if (convId) {
        navigate(`/chat/${encodeURIComponent(String(convId))}`)
      } else {
        toast.error(
          scd.chatOpenFailed || cd.chatOpenFailed || "Không thể mở hộp thoại.",
        )
      }
    } catch {
      toast.error(
        scd.chatOpenFailed || cd.chatOpenFailed || "Không thể mở hộp thoại.",
      )
    } finally {
      setMessagingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 text-[#2e2e2e]">
      {/* ─── 1. INTEGRATED LEADERSHIP & CAPACITY CARDS (3-COLUMN GRID) ─── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Sĩ số lớp học & Tiến trình lấp đầy */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 min-h-[148px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-[#990011]" />
              <span>Sĩ số lớp học</span>
            </span>
            {capacity !== null && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#990011] border border-red-100">
                {fillRate}% lấp đầy
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                {students.length}
              </span>
              {capacity !== null && (
                <span className="text-xs font-bold text-gray-400">
                  / {capacity} chỗ
                </span>
              )}
            </div>

            {capacity !== null ? (
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#990011] rounded-full transition-all duration-300"
                    style={{ width: `${fillRate}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-gray-500">
                  {remainingSlots === 0
                    ? "Lớp học đã đủ sĩ số"
                    : `Còn ${remainingSlots} chỗ nhận học viên`}
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-gray-500 mt-1">
                Lớp học không giới hạn sĩ số
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Giảng viên chính (Lead Instructor) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all border-l-4 border-l-[#990011] flex flex-col justify-between gap-3 min-h-[148px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={14} className="text-[#990011]" />
              <span>{cd.leadInstructorLabel || "Giảng viên chính"}</span>
            </span>
            {teacher?.id && isOwnAccount(teacher.id) ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                Bạn
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#990011] border border-red-100">
                Chủ nhiệm
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 shrink-0 rounded-full bg-red-50 text-[#990011] border-2 border-red-100 overflow-hidden font-black text-sm flex items-center justify-center shadow-xs ${
                teacher?.id ? "cursor-pointer hover:scale-105 transition" : ""
              }`}
              onClick={() => teacher?.id && handleProfileNavigate(teacher.id)}
              onKeyDown={handlePersonKeyDown(teacher?.id)}
              role={teacher?.id ? "button" : undefined}
              tabIndex={teacher?.id ? 0 : undefined}
              title={teacher?.id ? viewProfileLabel : undefined}
            >
              {teacherAvatar ? (
                <img
                  className="w-full h-full object-cover"
                  src={teacherAvatar}
                  alt={teacherName}
                />
              ) : (
                getInitials(teacherName)
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <h4
                className={`text-sm sm:text-base font-black text-gray-950 truncate ${
                  teacher?.id ? "cursor-pointer hover:text-[#990011] transition" : ""
                }`}
                onClick={() => teacher?.id && handleProfileNavigate(teacher.id)}
              >
                {teacherName || classWorkspace.unnamedTeacher || "Đang cập nhật"}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium truncate mt-0.5">
                {teacher?.email ? (
                  <span className="truncate">{teacher.email}</span>
                ) : teacher?.phone ? (
                  <span>{teacher.phone}</span>
                ) : (
                  <span className="text-gray-400">Chủ nhiệm lớp học</span>
                )}
              </div>
            </div>
          </div>

          {teacher?.id && !isOwnAccount(teacher.id) ? (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => handleStartChat(teacher.id, e)}
                disabled={messagingId === teacher.id}
                className="h-8 px-3 rounded-full border border-gray-200 hover:border-[#990011] hover:text-[#990011] hover:bg-red-50/50 bg-white text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <MessageSquare size={13} />
                <span>{cd.message || "Nhắn tin"}</span>
              </button>
              <ClassMemberFriendButton
                targetId={teacher.id}
                relationship={teacher?.relationship}
              />
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 italic pt-1 border-t border-gray-100/60">
              Phụ trách giảng dạy và duyệt bài học
            </div>
          )}
        </div>

        {/* Card 3: Co-host Lớp học (Co-host Manager Card) */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 min-h-[148px] ${
            hasCoHost
              ? "bg-gradient-to-br from-amber-50/40 via-white to-amber-50/15 border-amber-200/90 border-l-4 border-l-amber-500"
              : "bg-white border-gray-200/80 border-dashed hover:border-amber-300 hover:bg-amber-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Crown
                size={14}
                className={hasCoHost ? "text-amber-600 fill-amber-500/20" : "text-gray-400"}
              />
              <span>{roomsCoHost.coHostLabel || "Co-host hỗ trợ"}</span>
            </span>

            {hasCoHost ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                {initialPermissions.length}/11 quyền
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Chưa phân công
              </span>
            )}
          </div>

          {hasCoHost ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 shrink-0 rounded-full bg-amber-100 text-amber-900 border-2 border-amber-200 overflow-hidden font-black text-sm flex items-center justify-center shadow-xs ring-2 ring-amber-300/40 ring-offset-1 ${
                    coHostAccountId ? "cursor-pointer hover:scale-105 transition" : ""
                  }`}
                  onClick={() => coHostAccountId && handleProfileNavigate(coHostAccountId)}
                  onKeyDown={handlePersonKeyDown(coHostAccountId)}
                  role={coHostAccountId ? "button" : undefined}
                  tabIndex={coHostAccountId ? 0 : undefined}
                  title={coHostAccountId ? viewProfileLabel : undefined}
                >
                  {coHostAvatar ? (
                    <img
                      className="w-full h-full object-cover"
                      src={coHostAvatar}
                      alt={coHostName}
                    />
                  ) : (
                    getInitials(coHostName)
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <h4
                    className={`text-sm sm:text-base font-black text-gray-950 truncate ${
                      coHostAccountId ? "cursor-pointer hover:text-amber-700 transition" : ""
                    }`}
                    onClick={() => coHostAccountId && handleProfileNavigate(coHostAccountId)}
                  >
                    {coHostName || "Co-host lớp"}
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                    {coHostEmail || coHostPhone || "Hỗ trợ điều hành phòng học"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-100/80">
                {coHostAccountId && !isOwnAccount(coHostAccountId) && (
                  <button
                    type="button"
                    onClick={(e) => handleStartChat(coHostAccountId, e)}
                    disabled={messagingId === coHostAccountId}
                    className="h-8 px-3 rounded-full border border-amber-200 hover:border-amber-400 bg-white text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <MessageSquare size={13} />
                    <span>Nhắn tin</span>
                  </button>
                )}

                {isClassTeacher && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setCoHostModalOpen(true)}
                      className="h-8 px-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Quản lý quyền</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRevokeOpen(true)}
                      className="h-8 px-2.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Gỡ
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Crown size={20} className="fill-amber-500/20" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-800">
                    Chưa có Co-host
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    Hỗ trợ quản lý mic, camera, chia sẻ màn hình
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
                <span className="text-[11px] text-gray-400 font-medium">11 quyền tùy chọn</span>
                {isClassTeacher ? (
                  <button
                    type="button"
                    onClick={() => setCoHostModalOpen(true)}
                    className="h-9 px-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Crown size={14} className="fill-amber-300/30 shrink-0" />
                    <span>{roomsCoHost.add || "Phân công Co-host"}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">Chưa chỉ định</span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── 2. STUDENTS ROSTER SECTION (SINGLE-LINE INTEGRATED TOOLBAR) ─── */}
      <section id="class-members-list" className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col gap-4 sm:gap-5">
        {/* Unified Header & Filter Toolbar: Title on Left, Search + Sort + Invite Button on Right */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
              <Users size={17} />
            </div>
            <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight">
              {cd.studentsLabel || "Danh sách học viên"}
            </h3>
          </div>

          {/* Controls: Search + Sort + Primary CTA */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <input
                type="text"
                name="class-member-search"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                aria-label={
                  cd.searchMembers ||
                  cd.searchPlaceholder ||
                  "Tìm kiếm học viên..."
                }
                placeholder={cd.searchPlaceholder || "Tìm tên, email, SĐT..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 bg-gray-50/90 hover:bg-gray-100/70 focus:bg-white border border-gray-200/90 focus:border-[#990011]/50 focus:ring-2 focus:ring-[#990011]/10 outline-none rounded-full text-xs font-medium text-gray-800 transition-all placeholder:text-gray-400 shadow-2xs"
              />
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={cd.clearSearch || "Xóa tìm kiếm"}
                  title={cd.clearSearch || "Xóa tìm kiếm"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Button */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              title={sortLabel}
              aria-label={sortLabel}
              className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs ${
                sortOrder
                  ? "border-gray-300 bg-white hover:bg-gray-50 text-gray-800"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              {sortOrder === "asc" ? (
                <ArrowDownZA size={16} />
              ) : (
                <ArrowUpZA size={16} />
              )}
            </button>

            {/* Primary CTA Button: Mời học viên */}
            {isClassTeacher && onInviteStudents && (
              <button
                type="button"
                onClick={onInviteStudents}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#990011] hover:bg-[#80000e] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <UserPlus size={14} />
                <span>{cd.inviteStudent || "Mời học viên"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty Roster State */}
        {students.length === 0 ? (
          <EmptyState
            variant="component"
            icon={Users}
            iconClassName="w-10 h-10 mb-2 text-gray-300"
            title={cd.noStudents || "Chưa có học viên nào tham gia lớp này."}
            description={
              !isStudent
                ? cd.noStudentsHint ||
                  "Mời học viên tham gia lớp để bắt đầu giảng dạy."
                : null
            }
            action={
              !isStudent && onInviteStudents ? (
                <button
                  type="button"
                  onClick={onInviteStudents}
                  className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#990011] hover:bg-[#700000] text-white text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <UserPlus size={14} className="shrink-0" />
                  <span>{cd.inviteStudent || "Mời học viên"}</span>
                </button>
              ) : null
            }
          />
        ) : filteredStudents.length === 0 ? (
          /* Empty Search State */
          <EmptyState
            variant="component"
            icon={SearchX}
            iconClassName="w-10 h-10 mb-2 text-gray-300"
            title={
              cd.noStudentsFound ||
              cd.noFriendsFound ||
              "Không tìm thấy học viên phù hợp."
            }
            description={
              cd.noFriendsFoundDesc ||
              "Vui lòng thử tìm kiếm với từ khóa khác."
            }
            action={
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <X size={13} className="shrink-0" />
                <span>{cd.clearSearch || "Xóa tìm kiếm"}</span>
              </button>
            }
          />
        ) : (
          /* Student List */
          <div role="list" className="flex flex-col divide-y divide-gray-100">
            {sortedStudents.map((student, index) => {
              const id = getPersonId(student)
              const rawName = getPersonName(student)
              const isUnnamed = !rawName || rawName === classWorkspace.unnamedStudent
              const name = isUnnamed ? (classWorkspace.unnamedStudent || "Học viên") : rawName
              const avatar = getSafeMediaUrl(getMemberAvatar(student))
              const displayEmail = getMemberEmail(student)
              const displayPhone =
                student.phone ??
                student.Phone ??
                student.phoneNumber ??
                student.studentPhone ??
                student.StudentPhone ??
                ""
              const attendance =
                typeof student.attendance === "string"
                  ? student.attendance.trim().toUpperCase()
                  : null
              const attendanceConfig = attendance
                ? ATTENDANCE_MAP[attendance]
                : null
              const roleBadge = getRoleBadge(
                student.role,
                cd,
                studentRoleLabel,
              )
              const isOwn = isOwnAccount(id)
              const isCoHostUser =
                hasCoHost && String(id) === String(coHostAccountId)

              return (
                <div
                  key={id ?? `${name}-${index}`}
                  role="listitem"
                  className={`flex items-center justify-between gap-3 py-3.5 px-2.5 sm:px-3 rounded-2xl transition-all ${
                    isCoHostUser
                      ? "bg-amber-50/30 hover:bg-amber-50/60 border border-amber-200/50 my-1 shadow-2xs"
                      : "hover:bg-gray-50/80 border border-transparent"
                  }`}
                >
                  {/* Left Column: Avatar & Details */}
                  <div
                    className={`flex items-center gap-3 min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011]/30 ${
                      id ? "cursor-pointer group" : ""
                    }`}
                    role={id ? "button" : undefined}
                    tabIndex={id ? 0 : undefined}
                    title={id ? viewProfileLabel : undefined}
                    aria-label={
                      id ? `${viewProfileLabel}: ${name}` : undefined
                    }
                    onClick={() => handleProfileNavigate(id)}
                    onKeyDown={handlePersonKeyDown(id)}
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full font-black text-xs flex items-center justify-center shadow-xs overflow-hidden transition-all group-hover:scale-105 ${
                        isCoHostUser
                          ? "ring-2 ring-amber-400 ring-offset-1 bg-amber-100 text-amber-900"
                          : getAvatarPalette(id || name)
                      }`}
                    >
                      {avatar ? (
                        <img
                          className="w-full h-full object-cover"
                          src={avatar}
                          alt={name}
                        />
                      ) : (
                        getInitials(name)
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-extrabold truncate transition ${
                            isUnnamed ? "text-gray-600 italic" : "text-gray-900"
                          } group-hover:text-[#990011]`}
                        >
                          {name}
                        </span>

                        {/* Co-host Special Badge */}
                        {isCoHostUser && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
                            <Crown size={11} className="text-amber-700 fill-amber-500/30" />
                            <span>Co-host</span>
                          </span>
                        )}

                        {/* Normal Role Badge */}
                        {!isCoHostUser && roleBadge && (
                          <span
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${roleBadge.className}`}
                          >
                            {roleBadge.label}
                          </span>
                        )}

                        {isOwn && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                            Bạn
                          </span>
                        )}
                      </div>

                      {(displayEmail || displayPhone || isUnnamed) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                          {displayEmail && (
                            <span className="flex items-center gap-1">
                              <Mail
                                size={12}
                                className="text-gray-400 shrink-0"
                              />
                              <span className="truncate max-w-[170px] sm:max-w-[240px]">
                                {displayEmail}
                              </span>
                            </span>
                          )}
                          {displayPhone && (
                            <span className="flex items-center gap-1">
                              <Phone
                                size={12}
                                className="text-gray-400 shrink-0"
                              />
                              <span>{displayPhone}</span>
                            </span>
                          )}
                          {isUnnamed && id && !displayEmail && (
                            <span className="text-gray-400">
                              (Mã HV: #{id})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Attendance & Actions (Direct Chat + Direct Friend button) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {attendanceConfig && (
                      <span
                        className={`inline-flex items-center gap-1 shrink-0 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border shadow-2xs ${attendanceConfig.bg}`}
                      >
                        <attendanceConfig.icon size={13} className="shrink-0" />
                        <span className="hidden sm:inline">
                          {attendanceConfig.getKey(cd)}
                        </span>
                      </span>
                    )}

                    {/* Direct Quick Chat Button */}
                    {id && !isOwn && (
                      <button
                        type="button"
                        onClick={(e) => handleStartChat(id, e)}
                        disabled={messagingId === id}
                        title={cd.message || "Nhắn tin"}
                        aria-label={cd.message || "Nhắn tin"}
                        className="h-8 px-2.5 sm:px-3 rounded-full flex items-center justify-center gap-1.5 text-gray-600 hover:text-[#990011] hover:bg-red-50/60 active:bg-red-100 transition-all border border-gray-200/90 hover:border-red-200 text-xs font-bold shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <MessageSquare size={13} className="shrink-0" />
                        <span className="hidden md:inline">{cd.message || "Nhắn tin"}</span>
                      </button>
                    )}

                    {/* Direct Friend Action Button (No more 3-dots dropdown) */}
                    {id && !isOwn && (
                      <ClassMemberFriendButton
                        targetId={id}
                        relationship={student?.relationship}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ─── CO-HOST MODALS ─── */}
      <CoHostModal
        open={coHostModalOpen}
        onClose={() => setCoHostModalOpen(false)}
        title={roomsCoHost.assignCoHost || "Phân công Co-host"}
        roomName={classData?.name || "Lớp học"}
        roomType="class"
        candidates={coHostCandidates}
        initialAccountId={initialAccountId}
        initialPermissions={initialPermissions}
        confirmLabel={
          hasCoHost
            ? roomsCoHost.saveChanges || "Lưu thay đổi"
            : roomsCoHost.assignCoHost || "Phân công Co-host"
        }
        isSaving={isSavingCoHost}
        onSubmit={handleCoHostSubmit}
      />

      <ConfirmationModal
        open={confirmRevokeOpen}
        onClose={() => setConfirmRevokeOpen(false)}
        onConfirm={handleCoHostRevoke}
        title={roomsCoHost.confirmRevokeTitle || "Xác nhận gỡ Co-host"}
        message={
          roomsCoHost.confirmRevokeMessage ||
          "Bạn có chắc muốn gỡ phân công Co-host này? Hành động này không thể hoàn tác."
        }
        cancelText={roomsCoHost.cancel || "Hủy"}
        confirmText={roomsCoHost.delete || "Gỡ"}
        confirmVariant="destructive"
        isPending={isRevokingCoHost}
      />

      <Modal
        open={revokeSuccessOpen}
        onClose={() => setRevokeSuccessOpen(false)}
        showCloseButton={false}
        bodyClassName="p-6 !mb-0"
        className="max-w-md"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-in zoom-in-75">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1.5">
            {roomsCoHost.revokeSuccessTitle || "Đã gỡ phân công Co-host!"}
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm leading-relaxed">
            {roomsCoHost.revokeSuccessMessage ||
              "Phân công Co-host đã được gỡ thành công khỏi lớp học."}
          </p>
          <PillButton
            onClick={() => setRevokeSuccessOpen(false)}
            className="w-full"
          >
            {roomsCoHost.done || "Hoàn tất"}
          </PillButton>
        </div>
      </Modal>
    </div>
  )
}

export default ClassMembersTab
