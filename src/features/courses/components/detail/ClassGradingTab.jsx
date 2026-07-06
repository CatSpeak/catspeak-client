import React, { useState, useMemo } from "react"
import { useGetClassGradingQuery, useGradeAssignmentMutation } from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { toast } from "react-hot-toast"
import { MOCK_GRADING } from "./classMockData"

// Toggle switch: set to false to use real API endpoint after backend is ready
const USE_MOCK = true

const ClassGradingTab = ({ id, isStudent, language }) => {
  const notifyInDevelopment = () => {
    toast.success("Tính năng đang phát triển")
  }

  const { data: gradingResponse, isLoading, error } = useGetClassGradingQuery(id, { skip: USE_MOCK })
  const [gradeAssignment] = useGradeAssignmentMutation()

  const [localGrades] = useState({}) // { [itemId]: { status, grade } }

  const gradingList = useMemo(() => {
    const baseGrading = USE_MOCK
      ? MOCK_GRADING
      : (gradingResponse?.data || gradingResponse?.items || gradingResponse || [])

    return baseGrading.map(item => {
      if (localGrades[item.id]) {
        return { ...item, ...localGrades[item.id] }
      }
      return item
    })
  }, [gradingResponse, localGrades])

  const handleGradeSubmission = async (itemId, studentName) => {
    if (USE_MOCK) {
      notifyInDevelopment()
      return
    }

    const gradeInput = prompt(
      language === "vi"
        ? `Nhập điểm cho ${studentName} (0 - 10):`
        : `Enter grade for ${studentName} (0 - 10):`,
      "10"
    )
    if (gradeInput === null) return
    const parsedGrade = parseFloat(gradeInput)
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      toast.error(
        language === "vi"
          ? "Điểm số không hợp lệ. Vui lòng nhập từ 0 đến 10"
          : "Invalid grade. Please enter between 0 and 10"
      )
      return
    }

    try {
      await gradeAssignment({ classId: id, assignmentId: itemId, grade: parsedGrade }).unwrap()
      toast.success(language === "vi" ? "Đã chấm điểm thành công!" : "Graded successfully!")
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to submit grade")
    }
  }

  if (!USE_MOCK && isLoading) {
    return <LoadingSpinner className="flex justify-center items-center py-12" />
  }

  if (!USE_MOCK && error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Failed to load grading submissions: {error.message || "Unknown error"}
      </div>
    )
  }

  return (
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
        {gradingList.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-bold">
            {language === "vi" ? "Chưa có bài tập hay bài nộp nào." : "No assignments or submissions yet."}
          </div>
        ) : (
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
                  {!isStudent && <td className="p-3 font-extrabold text-gray-800">{item.studentName || item.student?.fullName || "Student"}</td>}
                  <td className="p-3 font-bold text-gray-650">{item.title || item.assignmentTitle || "Homework"}</td>
                  <td className="p-3 text-gray-400 font-semibold">{item.dueDate || "N/A"}</td>
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
                    {item.grade !== null && item.grade !== undefined ? item.grade : "—"}
                  </td>
                  <td className="p-3 text-center">
                    {isStudent ? (
                      item.status === "Ungraded" ? (
                        <button
                          onClick={notifyInDevelopment}
                          className="h-7 px-3 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                        >
                          {language === "vi" ? "Nộp bài" : "Submit"}
                        </button>
                      ) : item.status === "Resubmitted" ? (
                        <button
                          onClick={notifyInDevelopment}
                          className="h-7 px-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                        >
                          {language === "vi" ? "Nộp lại" : "Resubmit"}
                        </button>
                      ) : (
                        <button
                          onClick={notifyInDevelopment}
                          className="h-7 px-3 bg-gray-100 hover:bg-gray-150 text-gray-600 font-bold text-[10px] rounded-lg transition-all"
                        >
                          {language === "vi" ? "Xem nhận xét" : "View feedback"}
                        </button>
                      )
                    ) : (
                      item.status !== "Graded" ? (
                        <button
                          onClick={() => handleGradeSubmission(item.id, item.studentName || item.student?.fullName || "Student")}
                          className="h-7 px-3 bg-[#990011] hover:bg-[#80000e] text-white font-bold text-[10px] rounded-lg transition-all active:scale-95 shadow-xs"
                        >
                          Grade
                        </button>
                      ) : (
                        <button
                          onClick={notifyInDevelopment}
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
        )}
      </div>
    </div>
  )
}

export default ClassGradingTab
