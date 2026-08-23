import React, { useMemo, useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import { PillButton } from "@/shared/components/ui/buttons"
import { Checkbox, TextInput } from "@/shared/components/ui/inputs"
import { Search, FileText, CheckSquare, Inbox, X, Plus, Eye } from "lucide-react"
import { useGetTeacherAssignmentsQuery, useGetTeacherQuizzesQuery } from "@/store/api/coursesApi"
import ToggleOption from "../ui/ToggleOption"
import { getAssignmentTitle, getAssignmentStatus } from "../../../../utils/assignmentUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import toast from "react-hot-toast"

const AddActivityModal = ({
  open = false,
  onClose = () => { },
  onSubmit = () => { },
  classId,
}) => {
  const { t } = useLanguage()
  const { formatDateTime } = useTimezone()
  const dict = t.courses.lectureHall.modals.addActivity || {}
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedIds, setSelectedIds] = useState([])
  const [prevOpen, setPrevOpen] = useState(open)

  const [isVisibleToStudents, setIsVisibleToStudents] = useState(true)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearchQuery("")
      setFilterType("all")
      setSelectedIds([])
      setIsVisibleToStudents(true)
    }
  }

  const handleToggleSelect = (uid) => {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((item) => item !== uid) : [...prev, uid]
    )
  }

  const { data: assignmentsResponse, isLoading: isLoadingAssignments } = useGetTeacherAssignmentsQuery(
    { classId, onlyUnassigned: true },
    { skip: !classId || !open }
  )

  const { data: quizzesResponse, isLoading: isLoadingQuizzes } = useGetTeacherQuizzesQuery(
    { classId, onlyUnassigned: true },
    { skip: !classId || !open }
  )

  const isLoading = isLoadingAssignments || isLoadingQuizzes

  const activities = useMemo(() => {
    const rawAssignments = assignmentsResponse?.data || assignmentsResponse || []
    const assignmentsList = (Array.isArray(rawAssignments) ? rawAssignments : []).map(a => ({ ...a, _activityType: "assignment" }))

    const rawQuizzes = quizzesResponse?.data || quizzesResponse || []
    const quizzesList = (Array.isArray(rawQuizzes) ? rawQuizzes : []).map(q => ({ ...q, _activityType: "quiz" }))

    return [...assignmentsList, ...quizzesList]
  }, [assignmentsResponse, quizzesResponse])

  console.log(activities)

  const filteredActivities = activities.filter((act) => {
    if (filterType !== "all" && act._activityType !== filterType) return false

    const title = act._activityType === "quiz"
      ? (act.title || act.name || dict.defaultQuizName)
      : getAssignmentTitle(act, dict.defaultAssignmentName)
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSubmit = () => {

    if (selectedIds.length === 0) {
      toast.error(dict.toastSelectionRequired)
      return
    }

    const chosenActivities = activities
      .filter((a) => selectedIds.includes(`${a._activityType}-${a.id}`))
      .map((act) => ({
        id: act.id,
        _activityType: act._activityType,
        title: act._activityType === "quiz"
          ? (act.title || act.name || dict.defaultQuizName)
          : getAssignmentTitle(act, dict.defaultAssignmentName),
        dueDate: act.dueDate
          ? formatDateTime(act.dueDate)
          : dict.noDueDate,
        isVisibleToStudents,
      }))
    onSubmit(chosenActivities)
    onClose()
  }

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case "assignment":
        return "bg-[#E6F4EA] text-[#137333]"
      case "quiz":
        return "bg-[#FCE8E6] text-[#C5221F]"
      default:
        return "bg-[#FFDBCF] text-[#380D00]"
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="w-full relative flex items-center justify-center">
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#191C1D]">
            {dict.title || "Thêm hoạt động học tập"}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="absolute right-0 -mr-2 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
      }
      showCloseButton={false}
      fullScreenOnMobile={false}
      className="md:max-w-[900px] rounded-[24px] h-auto max-h-[95vh] md:max-h-[800px]"
      headerClassName="flex items-center justify-between px-6 md:px-10 py-6 md:py-8"
      bodyClassName="px-6 md:px-10 pb-6 flex-1 overflow-y-auto"
      footerClassName="p-0"
      footer={
        <div className="flex justify-between gap-4 px-6 md:px-10 pb-8 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[52px] rounded-full border border-[#990011] text-[#990011] font-medium text-base flex justify-center items-center gap-2 hover:bg-red-50 transition-colors"
          >
            {dict.cancel || "Hủy"} <X size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="flex-1 h-[52px] rounded-full bg-[#990011] text-white font-medium text-base flex justify-center items-center gap-2 hover:bg-[#80000e] transition-colors disabled:opacity-70"
          >
            {dict.add || "Thêm hoạt động"} <Plus size={18} strokeWidth={2} />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Activity Items List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner text={t.courses.lectureHall.loading} />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
              <Inbox size={48} className="mb-3 opacity-50" strokeWidth={1.5} />
              <p className="text-sm font-medium">{dict.noActivitiesFound}</p>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const uid = `${act._activityType}-${act.id}`
              const isChecked = selectedIds.includes(uid)
              const title = act._activityType === "quiz"
                ? (act.title || act.name || dict.defaultQuizName)
                : getAssignmentTitle(act, dict.defaultAssignmentName)
              const rawStatus = act._activityType === "quiz" ? (act.status || "Published") : getAssignmentStatus(act)
              const statusLower = String(rawStatus).toLowerCase()
              const statusLabel = statusLower === "published"
                ? (dict.statusPublished || "Đã xuất bản")
                : statusLower === "draft"
                  ? (dict.statusDraft || "Bản nháp")
                  : statusLower === "upcoming"
                    ? (dict.statusUpcoming || "Sắp tới")
                    : (dict.statusClosed || "Đã đóng")

              const type = act._activityType
              const typeLabel = act._activityType === "quiz" ? dict.typeQuiz : dict.typeSubmission
              let timeInfo = null
              if (act._activityType === "assignment") {
                const dueDateLabel = act.dueDate
                  ? formatDateTime(act.dueDate)
                  : dict.noDueDate
                timeInfo = (
                  <div className="text-right">
                    <span className="text-xs text-[#5B403C] block font-medium">
                      {dict.dueDate || "Hạn nộp"}
                    </span>
                    <span className="text-sm text-[#191C1D] font-normal">
                      {dueDateLabel}
                    </span>
                  </div>
                )
              } else if (act._activityType === "quiz") {
                const openTimeStr = act.openTime
                  ? formatDateTime(act.openTime)
                  : "-"
                const closeTimeStr = act.closeTime
                  ? formatDateTime(act.closeTime)
                  : "-"
                timeInfo = (
                  <div className="text-right flex flex-col gap-0.5 justify-end">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-[#5B403C] font-medium">{dict.openTime || "Mở:"}</span>
                      <span className="text-sm text-[#191C1D] font-normal">{openTimeStr}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-[#5B403C] font-medium">{dict.closeTime || "Đóng:"}</span>
                      <span className="text-sm text-[#191C1D] font-normal">{closeTimeStr}</span>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={uid}
                  onClick={() => handleToggleSelect(uid)}
                  className={`rounded-[16px] p-4 flex items-center justify-between transition-all cursor-pointer ${isChecked
                    ? "bg-[#F9F9F9] ring-2 ring-cath-red-700"
                    : "bg-[#F9F9F9] hover:bg-gray-100"
                    }`}
                >
                  {/* Checkbox & Left info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => { }}
                      aria-label={dict.selectActivityAriaLabel ? dict.selectActivityAriaLabel.replace("{{title}}", title) : ""}
                    />

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-h-5">
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#777777] text-white flex items-center gap-1">
                          {statusLower === "published" && <CheckSquare size={10} />}
                          {statusLower === "draft" && <FileText size={10} />}
                          {statusLabel}
                        </span>

                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${getTypeBadgeStyle(
                            type
                          )}`}
                        >
                          {type === "assignment" && <FileText size={10} />}
                          {type === "quiz" && <CheckSquare size={10} />}
                          {typeLabel}
                        </span>
                      </div>

                      <h5 className="text-[14px] font-normal text-[#191C1D] truncate">
                        {title}
                      </h5>
                    </div>
                  </div>

                  {/* Right info (Times) */}
                  {timeInfo}
                </div>
              )
            })
          )}
        </div>

        {/* Toggle Option */}
        <div className="pt-2">
          <ToggleOption
            icon={<Eye size={20} className="text-[#F83B4F]" />}
            iconBg="bg-[#FFEAED]"
            title={dict.visibleToStudents || "Hiển thị với học viên"}
            description={dict.visibleToStudentsDesc || "Tùy chỉnh độ hiển thị với học viên"}
            checked={isVisibleToStudents}
            onChange={(e) => setIsVisibleToStudents(e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  )
}

export default AddActivityModal
