import React, { useState, useMemo, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"
import { getSafeMediaUrl } from "../../utils/courseUtils"
import ClassMemberActionDropdown from "./ClassMemberActionDropdown"
import {
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Users,
  Search,
  X,
  ArrowDownZA,
  ArrowUpZA,
} from "lucide-react"

const getPersonId = (person) =>
  person?.id ?? person?.accountId ?? person?.studentId ?? person?.userId

const getPersonName = (person) => {
  if (!person || typeof person !== "object") return ""
  return String(
    person.name ??
      person.fullName ??
      person.studentName ??
      person.teacherName ??
      "",
  ).trim()
}

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

const getRoleBadge = (role, cd = {}) => {
  if (!role || typeof role !== "string") return null
  const normalized = role.trim().toLowerCase()
  if (normalized === "teacher" || normalized === "instructor") {
    return {
      label: cd.leadInstructorLabel || "Giảng viên",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    }
  }
  if (normalized === "assistant" || normalized === "ta") {
    return {
      label: "Trợ giảng",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    }
  }
  if (normalized === "student" || normalized === "member") {
    return {
      label: "Học viên",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    }
  }
  return {
    label: role,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  }
}

const ClassMembersTab = ({ classData, isStudent }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)
  const [createPrivateConversation] = useCreatePrivateConversationMutation()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  const [messagingId, setMessagingId] = useState(null)

  const c = t.courses || {}
  const cd = c.classDetail || {}
  const scd = c.studentCourseDetail || {}
  const classWorkspace = c.classWorkspace || {}

  const currentUserId = user?.accountId ?? user?.id ?? user?.userId
  const isOwnAccount = (targetId) => {
    if (!currentUserId || !targetId) return false
    return Number(currentUserId) === Number(targetId)
  }

  const teacher = useMemo(() => {
    const nestedTeacher = classData?.teacher ?? classData?.instructor
    if (nestedTeacher && typeof nestedTeacher === "object") {
      return {
        ...nestedTeacher,
        id: getPersonId(nestedTeacher),
        name: getPersonName(nestedTeacher),
        avatar:
          nestedTeacher.avatar ??
          nestedTeacher.avatarUrl ??
          nestedTeacher.avatarImageUrl,
        email: nestedTeacher.email,
        phone: nestedTeacher.phone,
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

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const query = normalizeSearchText(searchQuery)
    return students.filter((student) => {
      const name = normalizeSearchText(getPersonName(student))
      const email = normalizeSearchText(student.email ?? student.studentEmail)
      const phone = normalizeSearchText(
        student.phone ?? student.phoneNumber ?? student.studentPhone,
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

  const capacityValue = Number(classData?.capacity ?? classData?.slots)
  const capacity =
    Number.isFinite(capacityValue) && capacityValue >= 0
      ? Math.floor(capacityValue)
      : null
  const teacherName = getPersonName(teacher)
  const teacherAvatar = getSafeMediaUrl(teacher?.avatar ?? teacher?.avatarUrl)

  const handleProfileNavigate = (personId) => {
    if (personId) {
      navigate(`/profile/${personId}`)
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
    <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex flex-col gap-5 sm:gap-6">
      {/* ─── LEAD INSTRUCTOR SECTION ─── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5 flex items-center gap-2">
          <span>{cd.leadInstructor || "GIẢNG VIÊN CHÍNH"}</span>
        </h3>

        {teacherName ? (
          <div
            className={`flex items-center justify-between gap-2.5 sm:gap-3.5 p-3.5 sm:p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition ${
              teacher?.id ? "cursor-pointer group" : ""
            }`}
            onClick={() => teacher?.id && handleProfileNavigate(teacher.id)}
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-gray-200 overflow-hidden text-gray-700 font-black text-sm flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-[#990011] transition">
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
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#990011] transition truncate">
                    {teacherName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-red-50 text-[#990011] border border-red-100 shrink-0">
                    {cd.leadInstructorLabel || "Giảng viên chính"}
                  </span>
                </div>
                {(teacher.email || teacher.phone) && (
                  <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5 sm:mt-1">
                    {teacher.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-[220px]">
                          {teacher.email}
                        </span>
                      </span>
                    )}
                    {teacher.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400 shrink-0" />
                        <span>{teacher.phone}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {teacher?.id && !isOwnAccount(teacher.id) && (
              <ClassMemberActionDropdown
                targetId={teacher.id}
                relationship={teacher?.relationship}
                onStartChat={(e) => handleStartChat(teacher.id, e)}
                isMessaging={messagingId === teacher.id}
              />
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center text-xs font-bold text-gray-400">
            {classWorkspace.noInstructor || "Chưa có thông tin giảng viên."}
          </div>
        )}
      </section>

      {/* ─── STUDENTS ROSTER SECTION ─── */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-gray-50 pb-2">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <Users size={14} className="text-gray-400 shrink-0" />
            <span>
              {(cd.studentsLabel || "Học viên").toLocaleUpperCase()} (
              {filteredStudents.length}
              {capacity !== null ? ` / ${capacity}` : ""})
            </span>
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="relative w-full sm:w-64 shrink-0">
              <input
                type="text"
                aria-label={
                  cd.searchMembers ||
                  cd.searchPlaceholder ||
                  "Tìm kiếm học viên..."
                }
                placeholder={cd.searchPlaceholder || "Tìm tên, email, SĐT..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-7 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200/80 focus:border-[#990011]/40 focus:ring-2 focus:ring-[#990011]/10 outline-none rounded-full text-xs font-medium text-gray-800 transition-all placeholder:text-gray-400"
              />
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              title={
                sortOrder === "asc"
                  ? "Sắp xếp giảm dần theo tên (Z-A)"
                  : "Sắp xếp tăng dần theo tên (A-Z)"
              }
              aria-label={
                sortOrder === "asc"
                  ? "Sắp xếp giảm dần theo tên (Z-A)"
                  : "Sắp xếp tăng dần theo tên (A-Z)"
              }
              className="w-8 h-8 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              {sortOrder === "asc" ? (
                <ArrowDownZA size={15} />
              ) : (
                <ArrowUpZA size={15} />
              )}
            </button>
          </div>
        </div>

        {students.length === 0 ? (
          <div
            className="text-center py-8 text-xs text-gray-400 font-bold"
            role="status"
          >
            {cd.noStudents || "Chưa có học viên nào tham gia lớp này."}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div
            className="text-center py-8 text-xs text-gray-400 font-bold"
            role="status"
          >
            {cd.noStudentsFound ||
              cd.noFriendsFound ||
              "Không tìm thấy học viên phù hợp."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {sortedStudents.map((student, index) => {
              const id = getPersonId(student)
              const name =
                getPersonName(student) ||
                classWorkspace.unnamedStudent ||
                "Học viên"
              const avatar = getSafeMediaUrl(
                student.avatar ?? student.avatarUrl ?? student.avatarImageUrl,
              )
              const attendance =
                typeof student.attendance === "string"
                  ? student.attendance.trim().toUpperCase()
                  : null
              const attendanceConfig = attendance
                ? ATTENDANCE_MAP[attendance]
                : null
              const roleBadge = getRoleBadge(student.role, cd)
              const isOwn = isOwnAccount(id)

              return (
                <div
                  key={id ?? `${name}-${index}`}
                  className="flex items-center justify-between gap-2 sm:gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <div
                    className={`flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 ${id ? "cursor-pointer group" : ""}`}
                    onClick={() => handleProfileNavigate(id)}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center shadow-xs overflow-hidden group-hover:ring-2 group-hover:ring-[#990011] transition">
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
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 truncate group-hover:text-[#990011] transition">
                          {name}
                        </span>
                        {roleBadge && (
                          <span
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${roleBadge.className}`}
                          >
                            {roleBadge.label}
                          </span>
                        )}
                      </div>

                      {(student.email || student.phone) && (
                        <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-gray-500 font-medium mt-0.5">
                          {student.email && (
                            <span className="flex items-center gap-1">
                              <Mail
                                size={12}
                                className="text-gray-400 shrink-0"
                              />
                              <span className="truncate max-w-[150px] sm:max-w-[200px]">
                                {student.email}
                              </span>
                            </span>
                          )}
                          {student.phone && (
                            <span className="flex items-center gap-1">
                              <Phone
                                size={12}
                                className="text-gray-400 shrink-0"
                              />
                              <span>{student.phone}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {attendanceConfig && (
                      <span
                        className={`inline-flex items-center gap-1 shrink-0 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border shadow-2xs ${attendanceConfig.bg}`}
                      >
                        <attendanceConfig.icon size={13} className="shrink-0" />
                        <span>{attendanceConfig.getKey(cd)}</span>
                      </span>
                    )}

                    {id && !isOwn && (
                      <ClassMemberActionDropdown
                        targetId={id}
                        relationship={student?.relationship}
                        onStartChat={(e) => handleStartChat(id, e)}
                        isMessaging={messagingId === id}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ClassMembersTab
