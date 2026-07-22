import { Plus, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { MOCK_STUDENTS, MOCK_TEACHER } from "../../data/classMockData"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassMembersTab = ({ isStudent }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  const notifyInDevelopment = () => {
    toast.success(c.devMessage || "Feature in development")
  }

  const teacher = MOCK_TEACHER
  const studentsList = MOCK_STUDENTS

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
      {/* LEAD INSTRUCTOR */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5">
          {cd.leadInstructor || "LEAD INSTRUCTOR"}
        </h3>

        <div className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl border border-gray-50 hover:bg-gray-55 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden text-gray-700 font-black text-sm flex items-center justify-center shadow-xs">
              <img className="w-full h-full object-cover" src={teacher.avatar} alt={teacher.fullName} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-gray-800">{teacher.fullName}</span>
              <span className="text-[10px] text-gray-400 font-bold">{cd.leadInstructorLabel || "Lead Instructor"}</span>
            </div>
          </div>

          {!isStudent && (
            <button
              onClick={notifyInDevelopment}
              className="h-8 px-4 border border-[#990011] text-[#990011] hover:bg-red-50/50 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare size={13} />
              <span>{cd.message || "Message"}</span>
            </button>
          )}
        </div>
      </div>

      {/* STUDENTS */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
            {cd.studentsLabel ? `${cd.studentsLabel.toUpperCase()} (${studentsList.length} / 30)` : `STUDENTS (${studentsList.length} / 30)`}
          </h3>
          {!isStudent && (
            <button
              onClick={notifyInDevelopment}
              className="text-xs text-[#990011] font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={13} />
              <span>{cd.inviteStudent || "Invite Student"}</span>
            </button>
          )}
        </div>

        {studentsList.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 font-bold">
            {cd.noStudents || "No students have joined this class yet."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {studentsList.map((student) => (
              <div key={student.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 text-white font-black text-xs flex items-center justify-center shadow-xs overflow-hidden">
                    <img className="w-full h-full object-cover" src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"} alt={student.fullName} />
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
                      <span className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${student.attendance === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" :
                        student.attendance === "ABSENT_EXCUSED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        {student.attendance === "PRESENT" ? (cd.present || "Present") :
                          student.attendance === "ABSENT_EXCUSED" ? (cd.absentExcused || "Absent (Excused)") :
                            (cd.absentUnexcused || "Absent (Unexcused)")}
                      </span>
                    ) : (
                      <select
                        value={student.attendance || "PRESENT"}
                        onChange={notifyInDevelopment}
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
                        <option value="PRESENT">{cd.present || "Present"}</option>
                        <option value="ABSENT_EXCUSED">{cd.absentExcused || "Absent (Excused)"}</option>
                        <option value="ABSENT_UNEXCUSED">{cd.absentUnexcused || "Absent (Unexcused)"}</option>
                      </select>
                    )}
                  </div>

                  {!isStudent && (
                    <>
                      <button
                        onClick={notifyInDevelopment}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        onClick={notifyInDevelopment}
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
        )}
      </div>
    </div>
  )
}

export default ClassMembersTab
