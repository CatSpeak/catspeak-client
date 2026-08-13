import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import {RequestButton} from "@/shared/components/ui/buttons"
import { getSafeMediaUrl } from "../../utils/courseUtils"
import {
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Users,
} from "lucide-react"

const getPersonId = (person) => (
  person?.id ?? person?.accountId ?? person?.studentId ?? person?.userId
)

const getPersonName = (person) => {
  if (!person || typeof person !== "object") return ""
  return String(
    person.name
    ?? person.fullName
    ?? person.studentName
    ?? person.teacherName
    ?? "",
  ).trim()
}

const getInitials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "—"
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase()
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
    className: "bg-gray-50 text-gray-600 border-border",
  }
}

const ClassMembersTab = ({ classData, isStudent }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const classWorkspace = c.classWorkspace || {}

  const teacher = useMemo(() => {
    const nestedTeacher = classData?.teacher ?? classData?.instructor
    if (nestedTeacher && typeof nestedTeacher === "object") {
      return {
        ...nestedTeacher,
        id: getPersonId(nestedTeacher),
        name: getPersonName(nestedTeacher),
        avatar: nestedTeacher.avatar ?? nestedTeacher.avatarUrl ?? nestedTeacher.avatarImageUrl,
        email: nestedTeacher.email,
        phone: nestedTeacher.phone,
      }
    }

    const name = String(
      classData?.teacherName
      ?? classData?.instructorName
      ?? "",
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
    const candidates = [
      classData?.students,
      classData?.members,
      classData?.enrollments,
    ].find(Array.isArray) ?? []
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

      const key = personIdStr ? `id:${personIdStr}` : `name:${name.toLocaleLowerCase()}`
      if (seenIds.has(key)) return false
      seenIds.add(key)
      return true
    })
  }, [classData, teacher])

  const capacityValue = Number(classData?.capacity ?? classData?.slots)
  const capacity = Number.isFinite(capacityValue) && capacityValue >= 0
    ? Math.floor(capacityValue)
    : null
  const teacherName = getPersonName(teacher)
  const teacherAvatar = getSafeMediaUrl(
    teacher?.avatar ?? teacher?.avatarUrl,
  )

  const handleProfileNavigate = (personId) => {
    if (personId) {
      navigate(`/profile/${personId}`)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
      {/* ─── LEAD INSTRUCTOR SECTION ─── */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5 flex items-center gap-2">
          <span>{cd.leadInstructor || "GIẢNG VIÊN CHÍNH"}</span>
        </h3>

        {teacherName ? (
          <div
            className={`flex items-center gap-3.5 p-4 bg-gray-50/70 hover:bg-gray-100/70 rounded-2xl border border-gray-100 transition ${
              teacher?.id ? "cursor-pointer group" : ""
            }`}
            onClick={() => teacher?.id && handleProfileNavigate(teacher.id)}
          >
            <div className="w-11 h-11 shrink-0 rounded-full bg-gray-200 overflow-hidden text-gray-700 font-black text-sm flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-[#990011] transition">
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
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-gray-900 group-hover:text-[#990011] transition truncate">
                  {teacherName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#990011] border border-red-100">
                  {cd.leadInstructorLabel || "Giảng viên chính"}
                </span>
              </div>
              {(teacher.email || teacher.phone) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-medium mt-1">
                  {teacher.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{teacher.email}</span>
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
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs font-bold text-gray-400">
            {classWorkspace.noInstructor || "Chưa có thông tin giảng viên."}
          </div>
        )}
      </section>

      {/* ─── STUDENTS ROSTER SECTION ─── */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span>
              {(cd.studentsLabel || "Học viên").toLocaleUpperCase()} ({students.length}
              {capacity !== null ? ` / ${capacity}` : ""})
            </span>
          </h3>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-bold" role="status">
            {cd.noStudents || "Chưa có học viên nào tham gia lớp này."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {students.map((student, index) => {
              const id = getPersonId(student)
              const name = getPersonName(student) || (classWorkspace.unnamedStudent || "Học viên")
              const avatar = getSafeMediaUrl(student.avatar ?? student.avatarUrl ?? student.avatarImageUrl)
              const attendance = typeof student.attendance === "string" ? student.attendance.trim().toUpperCase() : null
              const attendanceConfig = attendance ? ATTENDANCE_MAP[attendance] : null
              const roleBadge = getRoleBadge(student.role, cd)

              return (
                <div
                  key={id ?? `${name}-${index}`}
                  className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                >
                  <div
                    className={`flex items-center gap-3 min-w-0 ${id ? "cursor-pointer group" : ""}`}
                    onClick={() => handleProfileNavigate(id)}
                  >
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center shadow-xs overflow-hidden group-hover:ring-2 group-hover:ring-[#990011] transition">
                      {avatar ? (
                        <img className="w-full h-full object-cover" src={avatar} alt={name} />
                      ) : (
                        getInitials(name)
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 truncate group-hover:text-[#990011] transition">
                          {name}
                        </span>
                        {roleBadge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleBadge.className}`}>
                            {roleBadge.label}
                          </span>
                        )}
                      </div>

                      {(student.email || student.phone) && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 font-medium mt-0.5">
                          {student.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{student.email}</span>
                            </span>
                          )}
                          {student.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-gray-400 shrink-0" />
                              <span>{student.phone}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {attendanceConfig && (
                      <span
                        className={`inline-flex items-center gap-1.5 shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${attendanceConfig.bg}`}
                      >
                        <attendanceConfig.icon size={13} className="shrink-0" />
                        <span>{attendanceConfig.getKey(cd)}</span>
                      </span>
                    )}

                    {id && (
                      <RequestButton
                        id={id}
                        relationship={student?.relationship || student}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* {!isStudent && students.length === 0 && (
        <p className="text-center text-[11px] font-semibold text-gray-400">
          {classWorkspace.rosterUnavailable || "Tính năng quản lý danh sách học viên hiện chưa khả dụng."}
        </p>
      )} */}
    </div>
  )
}

export default ClassMembersTab
