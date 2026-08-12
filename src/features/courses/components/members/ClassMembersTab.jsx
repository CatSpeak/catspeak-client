import { useMemo } from "react"

import { useLanguage } from "@/shared/context/LanguageContext"
import { getSafeMediaUrl } from "../../utils/courseUtils"

const getPersonId = (person) => (
  person?.studentId ?? person?.userId ?? person?.id
)

const getPersonName = (person) => {
  if (!person || typeof person !== "object") return ""
  return String(
    person.fullName
    ?? person.name
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

const getAttendanceStyle = (attendance) => {
  if (attendance === "PRESENT") {
    return "bg-green-50 text-green-700 border-green-200"
  }
  if (attendance === "ABSENT_EXCUSED") {
    return "bg-blue-50 text-blue-700 border-blue-200"
  }
  if (attendance === "ABSENT_UNEXCUSED") {
    return "bg-red-50 text-red-700 border-red-200"
  }
  return "bg-gray-50 text-gray-600 border-border"
}

const ClassMembersTab = ({ classData, isStudent }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const classWorkspace = c.classWorkspace || {}

  const teacher = useMemo(() => {
    const nestedTeacher = classData?.instructor ?? classData?.teacher
    if (nestedTeacher && typeof nestedTeacher === "object") return nestedTeacher

    const name = String(
      classData?.instructorName
      ?? classData?.teacherName
      ?? "",
    ).trim()
    if (!name) return null

    return {
      id: classData?.instructorId ?? classData?.teacherId,
      fullName: name,
      avatar: classData?.instructorAvatar ?? classData?.teacherAvatar,
    }
  }, [classData])

  const students = useMemo(() => {
    const candidates = [
      classData?.students,
      classData?.members,
      classData?.enrollments,
    ].find(Array.isArray) ?? []
    const seenIds = new Set()

    return candidates.filter((person) => {
      if (!person || typeof person !== "object") return false
      const role = String(person.role ?? "").toLowerCase()
      if (role === "teacher" || role === "instructor") return false

      const id = getPersonId(person)
      const name = getPersonName(person)
      if ((id === undefined || id === null) && !name) return false

      const key = id === undefined || id === null
        ? `name:${name.toLocaleLowerCase()}`
        : `id:${String(id)}`
      if (seenIds.has(key)) return false
      seenIds.add(key)
      return true
    })
  }, [classData])

  const capacityValue = Number(classData?.slots ?? classData?.capacity)
  const capacity = Number.isFinite(capacityValue) && capacityValue >= 0
    ? Math.floor(capacityValue)
    : null
  const teacherName = getPersonName(teacher)
  const teacherAvatar = getSafeMediaUrl(
    teacher?.avatarUrl ?? teacher?.avatar,
  )

  return (
    <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5">
          {cd.leadInstructor || "LEAD INSTRUCTOR"}
        </h3>

        {teacherName ? (
          <div className="flex items-center gap-3 p-3.5 bg-gray-50/50 rounded-xl border border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden text-gray-700 font-black text-sm flex items-center justify-center shadow-xs">
              {teacherAvatar ? (
                <img
                  className="w-full h-full object-cover"
                  src={teacherAvatar}
                  alt=""
                />
              ) : getInitials(teacherName)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-gray-800">{teacherName}</span>
              <span className="text-[10px] text-gray-400 font-bold">
                {cd.leadInstructorLabel || "Lead Instructor"}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs font-bold text-gray-400">
            {classWorkspace.noInstructor || "Instructor information is not available."}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            {(cd.studentsLabel || "Students").toLocaleUpperCase()} ({students.length}
            {capacity !== null ? ` / ${capacity}` : ""})
          </h3>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 font-bold" role="status">
            {cd.noStudents || "No student roster is available for this class."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {students.map((student, index) => {
              const id = getPersonId(student)
              const name = getPersonName(student)
                || (classWorkspace.unnamedStudent || "Unnamed student")
              const avatar = getSafeMediaUrl(student.avatarUrl ?? student.avatar)
              const attendance = typeof student.attendance === "string"
                ? student.attendance.toUpperCase()
                : null
              const detailParts = isStudent
                ? []
                : [student.email, student.phone].filter(
                  (value) => typeof value === "string" && value.trim(),
                )

              return (
                <div
                  key={id ?? `${name}-${index}`}
                  className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gray-200 text-gray-700 font-black text-xs flex items-center justify-center shadow-xs overflow-hidden">
                      {avatar ? (
                        <img className="w-full h-full object-cover" src={avatar} alt="" />
                      ) : getInitials(name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-extrabold text-gray-800 truncate">{name}</span>
                      {detailParts.length > 0 && (
                        <span className="text-[10px] text-gray-450 font-semibold truncate">
                          {detailParts.join(" • ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {["PRESENT", "ABSENT_EXCUSED", "ABSENT_UNEXCUSED"].includes(attendance) && (
                    <span className={`shrink-0 text-[10px] font-black px-2.5 py-1.5 rounded-lg border ${getAttendanceStyle(attendance)}`}>
                      {attendance === "PRESENT"
                        ? (cd.present || "Present")
                        : attendance === "ABSENT_EXCUSED"
                          ? (cd.absentExcused || "Absent (Excused)")
                          : (cd.absentUnexcused || "Absent (Unexcused)")}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {!isStudent && students.length === 0 && (
        <p className="text-center text-[11px] font-semibold text-gray-400">
          {classWorkspace.rosterUnavailable || "Roster management is not available yet."}
        </p>
      )}
    </div>
  )
}

export default ClassMembersTab
